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

export function trackLead(eventId) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {}, eventId ? { eventID: eventId } : undefined)
  }
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead')
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
