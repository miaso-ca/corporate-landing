// ponytail: stub — swap ENDPOINT_URL for the real Google Apps Script Web App URL
// once it exists (specs/corporate-landing.md #4-5: Sheets + email + Telegram).
const ENDPOINT_URL = ''

export async function submitLead(payload) {
  console.log('[submitLead] stub — would POST to', ENDPOINT_URL || '(endpoint not configured yet)', payload)
  return { ok: true }
}
