// Thin wrapper around Meta Pixel + GA4 (gtag.js) — both load as async
// third-party scripts from index.html, so every call is guarded against
// the script not having finished loading yet (defensive, not expected to
// fire in practice since these all trigger from user clicks well after
// page load).

// Shared between the browser Pixel event and the server-side Conversions
// API event (fired from Code.gs for the same submission) so Meta
// deduplicates the two into one Lead instead of double-counting it.
export function generateEventId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function trackLead(eventId, extra) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {}, eventId ? { eventID: eventId } : undefined)
  }
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', extra?.campaign ? { campaign: extra.campaign } : undefined)
  }
}

// method: 'phone' | 'email'
export function trackContact(method) {
  if (typeof window.fbq === 'function') window.fbq('track', 'Contact')
  if (typeof window.gtag === 'function') window.gtag('event', 'contact', { method })
}

// network: 'instagram' | 'facebook'
export function trackSocialClick(network) {
  if (typeof window.fbq === 'function') window.fbq('trackCustom', 'SocialClick', { network })
  if (typeof window.gtag === 'function') window.gtag('event', 'social_click', { network })
}

// format: the catering format name shown on the card, e.g. "Mobile Cart" —
// fired on click, before the smooth-scroll to the full form, so we can
// measure click-to-submit drop-off separately from the form itself.
export function trackCardClick(format) {
  if (typeof window.fbq === 'function') window.fbq('trackCustom', 'CardClick', { format })
  if (typeof window.gtag === 'function') window.gtag('event', 'card_click', { format })
}
