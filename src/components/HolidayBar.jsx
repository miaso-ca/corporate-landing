import { useState } from 'react'
import { setPreselect } from '../lib/preselect.js'
import { setCampaign } from '../lib/utm.js'
import './HolidayBar.css'

// Hides for good after this date (year boundary — 2026 → 2027) and also
// permanently once the visitor dismisses it (both checked before first
// paint so a dismissed/expired bar never flashes in, then out).
const HIDE_AFTER = new Date('2027-01-15T00:00:00')
const DISMISS_KEY = 'miaso_holiday_bar_dismissed'

function isPastHideDate() {
  return new Date() >= HIDE_AFTER
}

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export default function HolidayBar() {
  const [dismissed, setDismissed] = useState(() => isPastHideDate() || wasDismissed())

  if (dismissed) return null

  function handleDismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Private browsing / storage disabled — worst case it reappears
      // next visit, not worth failing the dismiss click over.
    }
  }

  function handleCheckDates() {
    setPreselect({ eventType: 'Holiday Party' })
    setCampaign('holiday-2026')
  }

  return (
    <div className="holiday-bar">
      <p className="holiday-bar__text">
        <span className="holiday-bar__desktop">
          HOLIDAY 2026&nbsp;&nbsp;|&nbsp;&nbsp;Now booking November &amp; December holiday parties
        </span>
        <span className="holiday-bar__mobile">Now booking holiday parties</span>
      </p>
      <a className="holiday-bar__cta" href="#quote" onClick={handleCheckDates}>
        <span className="holiday-bar__desktop">Check availability</span>
        <span className="holiday-bar__mobile">Check dates</span>
      </a>
      <button
        className="holiday-bar__close"
        type="button"
        aria-label="Dismiss"
        onClick={handleDismiss}
      >
        ×
      </button>
    </div>
  )
}
