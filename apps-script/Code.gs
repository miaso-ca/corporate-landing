/**
 * MIASO corporate-landing lead capture endpoint.
 *
 * Deploy as a Web App (Extensions -> Apps Script in the target Google
 * Sheet, paste this file in as Code.gs, then Deploy -> New deployment ->
 * type "Web app", execute as "Me", access "Anyone"). Copy the resulting
 * /exec URL into src/lib/submitLead.js's ENDPOINT_URL.
 *
 * Required Script Properties (Project Settings -> Script Properties):
 *   TELEGRAM_BOT_TOKEN  - token from @BotFather
 *   TELEGRAM_CHAT_ID    - numeric chat id the bot should post leads into
 *   NOTIFY_EMAIL        - comma-separated email address(es) for notifications
 *   META_CAPI_TOKEN     - Conversions API access token, from Events Manager
 *                         > (the Pixel) > Settings > Conversions API >
 *                         "Generate access token"
 * Optional:
 *   TELEGRAM_THREAD_ID  - forum topic id, only if the target chat is a
 *                         supergroup with topics and leads should land in
 *                         one specific topic instead of General
 *
 * One row per lead, one sheet ("Leads") shared by all three site forms
 * (quick-capture x2 + full form) - the `source` column tells them apart.
 * Each of the four channels (Sheet / email / Telegram / Meta Conversions
 * API) is wrapped in its own try/catch so one failing never blocks the
 * others. Meta CAPI is a pure analytics side-channel - success/failure
 * there doesn't count toward whether the lead "worked" for the visitor.
 */

var SHEET_NAME = 'Leads';
var META_PIXEL_ID = '1650470559273087';

// New fields get appended to the END, never inserted in the middle - the
// Sheet already has real rows written under the old column order, and
// inserting a column here would silently shift every value in those rows
// one cell to the right of its real header.
var COLUMNS = [
  'timestamp', 'source', 'name', 'email', 'phone', 'eventDate',
  'company', 'guests', 'venue', 'budget', 'format', 'dietary', 'details',
  'eventType', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
];

function doPost(e) {
  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload' });
  }

  // Honeypot: the site's forms carry a hidden "website" field real users
  // never see or fill. A filled value means either a bot that blindly
  // fills every field on the scraped HTML form, or a scripted attacker
  // POSTing straight to this endpoint using the same field name. Fake a
  // normal success either way - do nothing, tell them nothing.
  if (payload.website) {
    return jsonResponse({ ok: true, channels: { sheet: true, email: true, telegram: true } });
  }

  var results = { sheet: false, email: false, telegram: false };

  try {
    appendToSheet(payload);
    results.sheet = true;
  } catch (err) {
    Logger.log('Sheet append failed: ' + err);
  }

  try {
    sendEmailNotification(payload);
    results.email = true;
  } catch (err) {
    Logger.log('Email send failed: ' + err);
  }

  try {
    sendTelegramNotification(payload);
    results.telegram = true;
  } catch (err) {
    Logger.log('Telegram send failed: ' + err);
  }

  try {
    sendMetaCapiEvent(payload);
  } catch (err) {
    Logger.log('Meta Conversions API send failed: ' + err);
  }

  var anyOk = results.sheet || results.email || results.telegram;
  return jsonResponse({ ok: anyOk, channels: results });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    return sheet;
  }

  // Self-healing header: if COLUMNS has grown since this sheet's header row
  // was written (e.g. a new field added after real rows already exist),
  // fill in only the missing header cells at the end - existing header
  // cells and every row already written under them are left untouched, so
  // old data never shifts out from under its real column.
  var lastCol = sheet.getLastColumn();
  var existingHeader = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  if (existingHeader.length < COLUMNS.length) {
    var missing = COLUMNS.slice(existingHeader.length);
    sheet.getRange(1, existingHeader.length + 1, 1, missing.length).setValues([missing]);
  }
  return sheet;
}

function appendToSheet(payload) {
  var sheet = getSheet();
  var row = COLUMNS.map(function (key) {
    if (key === 'timestamp') return new Date();
    return sheetSafe(payload[key] || '');
  });
  sheet.appendRow(row);
}

// Sheets treats a cell written via appendRow the same as one typed by hand -
// a value starting with =, +, - or @ is parsed as a formula. All of this
// payload is untrusted (site visitors can POST any field they like), so a
// leading apostrophe forces Sheets to store it as literal text instead.
function sheetSafe(value) {
  var str = String(value);
  return /^[=+\-@]/.test(str) ? "'" + str : str;
}

function sendEmailNotification(payload) {
  var props = PropertiesService.getScriptProperties();
  var to = props.getProperty('NOTIFY_EMAIL');
  if (!to) throw new Error('NOTIFY_EMAIL script property not set');

  var subject = 'New MIASO lead: ' + (payload.name || 'unknown') +
    ' (' + (payload.source || 'unknown source') + ')';
  var body = leadSummaryLines(payload).join('\n');

  MailApp.sendEmail(to, subject, body);
}

function sendTelegramNotification(payload) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatId) throw new Error('Telegram script properties not set');

  // Plain text, not Markdown - user-submitted fields could contain an
  // unescaped _/*/`/[ that either breaks Telegram's parser (400, lead
  // silently never reaches this channel) or renders as a clickable link.
  // Nothing here needs formatting badly enough to be worth escaping for.
  var text = 'New MIASO lead\n' + leadSummaryLines(payload).join('\n') +
    '\n\nAlso saved to the Sheet and emailed to ' + (props.getProperty('NOTIFY_EMAIL') || 'the team') +
    '.\nFull list: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();
  var body = { chat_id: chatId, text: text };
  var threadId = props.getProperty('TELEGRAM_THREAD_ID');
  if (threadId) body.message_thread_id = Number(threadId);

  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });

  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Telegram API returned ' + code + ': ' + response.getContentText());
  }
}

// Server-side duplicate of the browser's fbq('track','Lead') call, sent
// directly to Meta from here - unaffected by ad blockers, Safari ITP or
// third-party-cookie restrictions that quietly drop a chunk of the
// client-side Pixel's events. Shares `event_id` with the browser call
// (both fire for the same form submission) so Meta's deduplication
// collapses them into a single Lead instead of counting it twice.
function sendMetaCapiEvent(payload) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('META_CAPI_TOKEN');
  if (!token) throw new Error('META_CAPI_TOKEN script property not set');

  // Meta requires email/phone as SHA-256 hashes, never plaintext, in
  // user_data - lowercase+trimmed email, digits-only phone (their spec
  // wants country code included, no leading +/spaces/punctuation).
  var userData = {};
  if (payload.email) userData.em = [sha256Hex(payload.email.trim().toLowerCase())];
  if (payload.phone) {
    var digits = String(payload.phone).replace(/\D/g, '');
    if (digits) userData.ph = [sha256Hex(digits)];
  }

  var eventData = {
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: 'https://events.miaso.ca/',
    user_data: userData,
  };
  if (payload.eventId) eventData.event_id = String(payload.eventId);

  var url = 'https://graph.facebook.com/v19.0/' + META_PIXEL_ID + '/events?access_token=' + encodeURIComponent(token);
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ data: [eventData] }),
    muteHttpExceptions: true,
  });

  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Meta CAPI returned ' + code + ': ' + response.getContentText());
  }
}

function sha256Hex(str) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

// Shared plain-text summary used by both the email body and the Telegram
// message - only lists fields that were actually filled in, since the two
// quick-capture forms send a small subset of the full form's fields.
function leadSummaryLines(payload) {
  var labels = {
    source: 'Source', name: 'Name', email: 'Email', phone: 'Phone',
    eventType: 'Event type', eventDate: 'Event date', company: 'Company', guests: 'Guests',
    venue: 'Venue', budget: 'Budget', format: 'Format',
    dietary: 'Dietary', details: 'Details',
    utm_source: 'UTM source', utm_medium: 'UTM medium', utm_campaign: 'UTM campaign',
    utm_term: 'UTM term', utm_content: 'UTM content',
  };
  return COLUMNS.filter(function (key) { return key !== 'timestamp'; })
    .filter(function (key) { return payload[key]; })
    .map(function (key) { return labels[key] + ': ' + payload[key]; });
}
