// Hands a value from a click (Holiday bar CTA, a catering card's button)
// to FinalForm without prop-drilling through the whole tree — the button
// writes before navigating, FinalForm reads once on mount and clears it
// immediately, so a later plain click on the Nav's "FAQ"/etc. links (which
// never touch this key) or a manual visit to #quote never re-applies a
// stale value from an earlier click.
const KEY = 'miaso_preselect'

export function setPreselect(fields) {
  try {
    const current = JSON.parse(sessionStorage.getItem(KEY) || '{}')
    sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...fields }))
  } catch {
    // Private browsing / storage disabled — preselect is a convenience,
    // not worth failing the click over.
  }
}

export function readAndClearPreselect() {
  try {
    const raw = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
