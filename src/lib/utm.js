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

// Writes into utm_content (not utm_campaign) so an on-site interaction like
// the Holiday bar's CTA never overwrites a real ad's utm_campaign value for
// a visitor who arrived from an actual paid campaign - utm_content is the
// safe slot for this kind of supplementary, non-attribution tag.
export function setCampaign(campaign) {
  try {
    const current = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, utm_content: campaign }))
  } catch {
    // Private browsing / storage disabled - best-effort, not worth failing over.
  }
}
