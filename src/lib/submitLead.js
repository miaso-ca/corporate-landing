// Google Apps Script Web App deployed from apps-script/Code.gs — see that
// file's header comment for the deploy steps and required script properties.
const ENDPOINT_URL = ''

const TIMEOUT_MS = 12000

export async function submitLead(payload) {
  if (!ENDPOINT_URL) {
    console.warn('[submitLead] ENDPOINT_URL not configured yet — lead was not sent', payload)
    throw new Error('Lead submission is not configured yet')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(ENDPOINT_URL, {
      method: 'POST',
      // text/plain avoids a CORS preflight (Apps Script doesn't answer
      // OPTIONS requests) — the body is still valid JSON, Apps Script's
      // doPost just needs to JSON.parse it itself.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`Server responded ${res.status}`)

    const data = await res.json()
    if (!data.ok) throw new Error('All notification channels failed')

    return data
  } finally {
    clearTimeout(timeout)
  }
}
