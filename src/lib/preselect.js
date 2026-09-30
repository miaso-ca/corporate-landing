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
  // Same-tab sessionStorage writes never fire the native `storage` event
  // (that only fires in OTHER tabs) — FinalForm mounts once with the whole
  // page and never remounts when a same-document anchor link scrolls to
  // it, so without this event it would never see a value set after its
  // own mount (the real-world case: load page once, then click a card).
  window.dispatchEvent(new CustomEvent('miaso:preselect', { detail: fields }))
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

// Used by FinalForm's live event listener, which already has the value
// from the event itself - this only needs to clear storage so a later
// page reload this same session doesn't re-apply a stale value.
export function clearPreselect() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Private browsing / storage disabled - nothing to clear.
  }
}
