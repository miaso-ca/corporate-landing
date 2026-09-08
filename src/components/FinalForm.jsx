import { Fragment, useRef, useState } from 'react'
import { submitLead } from '../lib/submitLead.js'
import { trackContact } from '../lib/analytics.js'
import useReveal from '../hooks/useReveal.js'
import './FinalForm.css'

const EVENT_TYPES = [
  'Office Lunch or Meeting',
  'Team Celebration',
  'Client Event',
  'Company Milestone',
  'Not sure yet',
]

const CATERING_FORMATS = [
  'Boxed Lunches',
  'Shareable Platters',
  'Individual Cups & Boats',
  'Full-Service Catering',
  'Not sure yet',
]

const BUDGET_RANGES = [
  'Under $500',
  '$500 – $1,500',
  '$1,500 – $5,000',
  '$5,000 – $15,000',
  '$15,000+',
  'Not sure yet',
]

// `group` only marks where a new cluster starts — it's read once, to drop a
// section label ahead of that field, purely so the mobile single-column
// stack (11 fields, one screen-and-a-half of scrolling) reads as three short
// legs instead of one undifferentiated list. Doesn't change field order,
// requirements or the data shape submitted.
const FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, group: 'Your Details' },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
  { name: 'company', label: 'Company', type: 'text', required: false },
  {
    name: 'eventType',
    label: 'Event Type',
    type: 'select',
    required: true,
    options: EVENT_TYPES,
    group: 'Event Details',
  },
  { name: 'eventDate', label: 'Event Date', type: 'date', required: false },
  { name: 'guests', label: 'Number of Guests', type: 'number', required: true, min: 1, max: 2000 },
  { name: 'venue', label: 'Venue or Location', type: 'text', required: false },
  { name: 'budget', label: 'Approximate Budget', type: 'select', required: true, options: BUDGET_RANGES },
  { name: 'format', label: 'Preferred Catering Format', type: 'select', required: true, options: CATERING_FORMATS },
  { name: 'dietary', label: 'Dietary Requirements', type: 'textarea', required: false, group: 'Anything Else?' },
  { name: 'details', label: 'Additional Details', type: 'textarea', required: false },
]

const INITIAL_VALUES = FIELDS.reduce((acc, { name }) => ({ ...acc, [name]: '' }), { website: '' })

// yyyy-mm-dd in the visitor's own timezone (not UTC — toISOString() would
// roll a late-evening local date back to "yesterday" for anyone west of
// UTC), used as the date input's min so the picker can't select the past.
function todayLocalISO() {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d - offset).toISOString().slice(0, 10)
}
const TODAY = todayLocalISO()

// ponytail: basic shape check, not full RFC 5322 — good enough to catch typos client-side
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// type="tel" accepts any text (no built-in format), so "asdf" passed
// straight through with zero pushback. Not a full E.164 parser — just:
// only phone-shaped characters, and enough digits to plausibly be a number.
function isValidPhone(value) {
  return /^[+\d\s().-]+$/.test(value) && (value.match(/\d/g) || []).length >= 7
}

export default function FinalForm() {
  const { ref, visible } = useReveal()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState('')
  // Mirrors `submitting` but updates synchronously, unlike React state
  // (which batches) - a real guard against two clicks landing in the same
  // tick before a re-render has disabled the button, each seeing the
  // stale pre-render `submitting=false` and both slipping past the check.
  const submittingRef = useRef(false)

  function handleChange(name, value) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  function validate() {
    const next = {}
    FIELDS.forEach(({ name, label, required, type, min, max }) => {
      const value = values[name].trim()
      if (required && !value) {
        next[name] = `${label} is required`
      } else if (name === 'email' && value && !EMAIL_RE.test(value)) {
        next[name] = 'Enter a valid email address'
      } else if (name === 'phone' && value && !isValidPhone(value)) {
        next[name] = 'Enter a valid phone number'
      } else if (type === 'number' && value) {
        // Native number inputs already block letters as you type, but not
        // "-5", "0" or "1e10" - all syntactically valid numbers with no
        // min/max set. Guard against those explicitly.
        const num = Number(value)
        if (!Number.isInteger(num) || num < min || num > max) {
          next[name] = `Enter a number between ${min} and ${max}`
        }
      } else if (type === 'date' && value && value < TODAY) {
        next[name] = "Pick today's date or later"
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submittingRef.current || !validate()) return
    submittingRef.current = true

    // Honeypot tripped — fake a normal success without ever hitting the
    // network. See QuickCaptureForm.jsx for the matching field/comment.
    if (values.website) {
      setSubmitting(true)
      await new Promise((r) => setTimeout(r, 600))
      setDone(true)
      setSubmitting(false)
      submittingRef.current = false
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      await submitLead({ ...values, source: 'full-form' })
      setDone(true)
    } catch (err) {
      setSubmitError('Something went wrong — please try again, or call us at 416-613-0078.')
    } finally {
      setSubmitting(false)
      submittingRef.current = false
    }
  }

  return (
    <section className="section" id="quote">
      <div className={`final-form reveal ${visible ? 'reveal--visible' : ''}`} ref={ref}>
        <h2>Let&rsquo;s Plan an Event Your Guests Will Remember</h2>
        <p className="final-form__intro">
          Tell us a little about your event, and we&rsquo;ll recommend the right catering format
          and prepare a personalized quote.
        </p>

        {done ? (
          <div className="final-form__done state-swap-in">
            <span className="pill pill--on-light">
              Thanks — we&rsquo;ll follow up within 1 business day.
            </span>
          </div>
        ) : (
          <form className="final-form__form" onSubmit={handleSubmit} noValidate>
            {/* Honeypot — see QuickCaptureForm.jsx for the full comment */}
            <input
              type="text"
              name="website"
              value={values.website}
              onChange={(e) => handleChange('website', e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
            />
            <div className="final-form__grid">
              {FIELDS.map(({ name, label, type, options, group, min, max }) => (
                <Fragment key={name}>
                  {group && <span className="final-form__group-label">{group}</span>}
                  <div
                    className={`final-form__field${
                      type === 'textarea' ? ' final-form__field--full' : ''
                    }`}
                  >
                    <label htmlFor={`final-${name}`}>{label}</label>
                    {type === 'select' ? (
                      <select
                        id={`final-${name}`}
                        value={values[name]}
                        onChange={(e) => handleChange(name, e.target.value)}
                      >
                        <option value="" disabled>
                          Select an option
                        </option>
                        {options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : type === 'textarea' ? (
                      <textarea
                        id={`final-${name}`}
                        rows={3}
                        value={values[name]}
                        onChange={(e) => handleChange(name, e.target.value)}
                      />
                    ) : (
                      <input
                        id={`final-${name}`}
                        type={type}
                        value={values[name]}
                        onChange={(e) => handleChange(name, e.target.value)}
                        min={type === 'date' ? TODAY : min}
                        max={type === 'number' ? max : undefined}
                        step={type === 'number' ? 1 : undefined}
                      />
                    )}
                    {errors[name] && <span className="final-form__error">{errors[name]}</span>}
                  </div>
                </Fragment>
              ))}
            </div>

            {submitError && <p className="final-form__error final-form__error--submit">{submitError}</p>}
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Request a Corporate Quote'}
            </button>

            <p className="final-form__disclaimer">
              Submitting this form does not reserve your date. Your booking is confirmed after
              availability has been reviewed, the quote has been approved and the required
              deposit has been received.
            </p>

            <p className="final-form__contact">
              Prefer to speak with us? <a href="tel:416-613-0078" onClick={() => trackContact('phone')}>416-613-0078</a> ·{' '}
              <a href="mailto:info@miaso.ca" onClick={() => trackContact('email')}>info@miaso.ca</a>
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
