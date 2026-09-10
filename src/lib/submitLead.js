import { trackLead, generateEventId } from './analytics.js'
import { getUtm } from './utm.js'

// Google Apps Script Web App deployed from apps-script/Code.gs — see that
// file's header comment for the deploy steps and required script properties.
const ENDPOINT_URL =
  'https://script.google.com/macros/s/AKfycbx9hByc4kOO0B9WL73Dg-H0vhRc82x8U47biaO16Ph1cZWLUDq9tWAJPj64x59RQ66w6Q/exec'

const TIMEOUT_MS = 12000

export async function submitLead(payload) {
  if (!ENDPOINT_URL) {
    console.warn('[submitLead] ENDPOINT_URL not configured yet — lead was not sent', payload)
    throw new Error('Lead submission is not configured yet')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  // Same id used for both the browser Pixel event below and the
  // server-side Conversions API event Code.gs fires for this same
  // submission, so Meta dedupes them into one Lead instead of two.
  const eventId = generateEventId()

  try {
    const res = await fetch(ENDPOINT_URL, {
      method: 'POST',
      // text/plain avoids a CORS preflight (Apps Script doesn't answer
      // OPTIONS requests) — the body is still valid JSON, Apps Script's
      // doPost just needs to JSON.parse it itself.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, eventId, site: 'corporate', ...getUtm() }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`Server responded ${res.status}`)

    const data = await res.json()
    if (!data.ok) throw new Error('All notification channels failed')

    trackLead(eventId)
    return data
  } finally {
    clearTimeout(timeout)
  }
}
