import { useState } from 'react'
import { submitLead } from '../lib/submitLead.js'
import './QuickCaptureForm.css'

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
]

// ponytail: basic shape check, not full RFC 5322 — good enough to catch typos client-side
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function QuickCaptureForm({ source }) {
  const [values, setValues] = useState({ name: '', email: '', phone: '', eventDate: '', website: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleChange(name, value) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  function validate() {
    const next = {}
    FIELDS.forEach(({ name, label, required }) => {
      if (required && !values[name].trim()) {
        next[name] = `${label} is required`
      } else if (name === 'email' && values.email.trim() && !EMAIL_RE.test(values.email.trim())) {
        next[name] = 'Enter a valid email address'
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting || !validate()) return

    // Honeypot tripped — a bot filled the hidden field. Fake a normal
    // success without ever hitting the network, so it doesn't learn
    // anything from the response and no bogus lead is sent anywhere.
    if (values.website) {
      setSubmitting(true)
      await new Promise((r) => setTimeout(r, 600))
      setDone(true)
      setSubmitting(false)
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      await submitLead({ ...values, source })
      await new Promise((r) => setTimeout(r, 600))
      setDone(true)
    } catch (err) {
      setSubmitError("Something went wrong — please try again, or call us at 416-613-0078.")
    } finally {
      setSubmitting(false)
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
      {FIELDS.map(({ name, label, type, hint }) => (
        <div className="quick-form__field" key={name}>
          <label htmlFor={`${source}-${name}`}>{label}</label>
          <input
            id={`${source}-${name}`}
            type={type}
            value={values[name]}
            onChange={(e) => handleChange(name, e.target.value)}
          />
          {hint && !errors[name] && <span className="quick-form__hint">{hint}</span>}
          {errors[name] && <span className="quick-form__error">{errors[name]}</span>}
        </div>
      ))}
      {submitError && <span className="quick-form__error quick-form__error--submit">{submitError}</span>}
      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Get My Quote'}
      </button>
    </form>
  )
}
