import { useRef, useState } from 'react'
import { submitLead } from '../lib/submitLead.js'
import './QuickCaptureForm.css'

const CATERING_FORMATS = [
  'Office Lunches & Drop-Off Catering',
  'Shareable Platters',
  'Individual Cups & Boats',
  'Mobile Cart',
  'Full-Service Catering',
  'Catering + Bar Service',
  'Not sure yet',
]

const FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
  {
    name: 'eventDate',
    label: 'Event Date',
    type: 'date',
    required: false,
    hint: "Optional — leave blank if you're not sure yet",
  },
  { name: 'guests', label: 'Number of Guests', type: 'number', required: true, min: 1, max: 2000 },
  { name: 'format', label: 'Catering Format', type: 'select', required: true, options: CATERING_FORMATS },
]

// ponytail: basic shape check, not full RFC 5322 — good enough to catch typos client-side
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// type="tel" accepts any text (no built-in format), so "asdf" passed
// straight through with zero pushback. Not a full E.164 parser — just:
// only phone-shaped characters, and enough digits to plausibly be a number.
function isValidPhone(value) {
  return /^[+\d\s().-]+$/.test(value) && (value.match(/\d/g) || []).length >= 7
}

// yyyy-mm-dd in the visitor's own timezone (not UTC — toISOString() would
// roll a late-evening local date back to "yesterday" for anyone west of
// UTC), used as the date input's min so the picker can't select the past.
function todayLocalISO() {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d - offset).toISOString().slice(0, 10)
}
const TODAY = todayLocalISO()

export default function QuickCaptureForm({ source }) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guests: '',
    format: '',
    website: '',
  })
  const [consent, setConsent] = useState(false)
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
    // type="tel" lets any character be typed; drop non-phone characters as they are entered.
    const next = name === 'phone' ? value.replace(/[^+\d\s().-]/g, '') : value
    setValues((v) => ({ ...v, [name]: next }))
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

    // Honeypot tripped — a bot filled the hidden field. Fake a normal
    // success without ever hitting the network, so it doesn't learn
    // anything from the response and no bogus lead is sent anywhere.
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
      await submitLead({ ...values, consent, source })
      await new Promise((r) => setTimeout(r, 600))
      setDone(true)
    } catch (err) {
      setSubmitError("Something went wrong — please try again, or call us at 416-613-0078.")
    } finally {
      setSubmitting(false)
      submittingRef.current = false
    }
  }

  if (done) {
    return (
      <div className="quick-form quick-form--done state-swap-in">
        <span className="pill pill--on-light">Thanks — we'll follow up within 1 business day.</span>
      </div>
    )
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot — invisible to sighted/screen-reader users (off-screen,
          aria-hidden, unreachable by Tab), but spam bots that blindly fill
          every input on a scraped form land right in it. Checked again
          server-side in Code.gs since a scripted attacker could skip the
          HTML entirely and POST straight to the endpoint. */}
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
      {FIELDS.map(({ name, label, type, hint, options, min, max }) => (
        <div className="quick-form__field" key={name}>
          <label htmlFor={`${source}-${name}`}>{label}</label>
          {type === 'select' ? (
            <select
              id={`${source}-${name}`}
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
          ) : (
            <input
              id={`${source}-${name}`}
              type={type}
              value={values[name]}
              onChange={(e) => handleChange(name, e.target.value)}
              min={type === 'date' ? TODAY : type === 'number' ? min : undefined}
              max={type === 'number' ? max : undefined}
              step={type === 'number' ? 1 : undefined}
            />
          )}
          {hint && !errors[name] && <span className="quick-form__hint">{hint}</span>}
          {errors[name] && <span className="quick-form__error">{errors[name]}</span>}
        </div>
      ))}
      <label className="quick-form__consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        I agree to receive news and special offers from MIASO by email, SMS and WhatsApp. I can
        unsubscribe at any{' '}time.
      </label>
      {submitError && <span className="quick-form__error quick-form__error--submit">{submitError}</span>}
      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Get My Quote'}
      </button>
      <p className="quick-form__privacy">
        By submitting, you agree to our{' '}
        <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}
