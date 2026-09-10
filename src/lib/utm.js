// Captures ad-campaign attribution once per visit so a lead's Sheet row /
// email / Telegram message shows which campaign it came from. sessionStorage
// (not just reading location.search at submit time) survives the visitor
// reloading the page after the ad click landed - the query string itself
// would be gone by then, but the attribution shouldn't be.
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
const STORAGE_KEY = 'miaso_utm'

export function captureUtm() {
  const params = new URLSearchParams(window.location.search)
  const found = {}
  UTM_KEYS.forEach((key) => {
    const value = params.get(key)
    if (value) found[key] = value
  })
  if (Object.keys(found).length > 0) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found))
    } catch {
      // Private browsing / storage disabled - attribution is best-effort,
      // not worth failing anything over.
    }
  }
}

export function getUtm() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
