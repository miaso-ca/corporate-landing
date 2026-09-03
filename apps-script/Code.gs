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
 * Optional:
 *   TELEGRAM_THREAD_ID  - forum topic id, only if the target chat is a
 *                         supergroup with topics and leads should land in
 *                         one specific topic instead of General
 *
 * One row per lead, one sheet ("Leads") shared by all three site forms
 * (quick-capture x2 + full form) - the `source` column tells them apart.
 * Each of the three channels (Sheet / email / Telegram) is wrapped in its
 * own try/catch so one failing never blocks the other two.
 */

var SHEET_NAME = 'Leads';

var COLUMNS = [
  'timestamp', 'source', 'name', 'email', 'phone', 'eventDate',
  'company', 'guests', 'venue', 'budget', 'format', 'dietary', 'details',
];

function doPost(e) {
  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload' });
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
  var text = 'New MIASO lead\n' + leadSummaryLines(payload).join('\n');
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

// Shared plain-text summary used by both the email body and the Telegram
// message - only lists fields that were actually filled in, since the two
// quick-capture forms send a small subset of the full form's fields.
function leadSummaryLines(payload) {
  var labels = {
    source: 'Source', name: 'Name', email: 'Email', phone: 'Phone',
    eventDate: 'Event date', company: 'Company', guests: 'Guests',
    venue: 'Venue', budget: 'Budget', format: 'Format',
    dietary: 'Dietary', details: 'Details',
  };
  return COLUMNS.filter(function (key) { return key !== 'timestamp'; })
    .filter(function (key) { return payload[key]; })
    .map(function (key) { return labels[key] + ': ' + payload[key]; });
}
