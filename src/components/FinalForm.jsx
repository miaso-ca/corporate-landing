import { useState } from 'react'
import { submitLead } from '../lib/submitLead.js'
import useReveal from '../hooks/useReveal.js'
import './FinalForm.css'

const CATERING_FORMATS = [
  'Corporate Lunches & Drop-Off Catering',
  'Grazing Tables',
  'Mobile Cart Experience',
  'Full-Service Corporate Catering',
  'Not sure yet',
]

const FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'company', label: 'Company', type: 'text', required: true },
  { name: 'email', label: 'Work Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
  { name: 'eventType', label: 'Event Type', type: 'text', required: true },
  { name: 'eventDate', label: 'Event Date', type: 'date', required: true },
  { name: 'guests', label: 'Number of Guests', type: 'number', required: true },
  { name: 'venue', label: 'Venue or Location', type: 'text', required: true },
  { name: 'budget', label: 'Approximate Budget', type: 'text', required: true },
  { name: 'format', label: 'Preferred Catering Format', type: 'select', required: true, options: CATERING_FORMATS },
  { name: 'dietary', label: 'Dietary Requirements', type: 'textarea', required: false },
  { name: 'details', label: 'Additional Details', type: 'textarea', required: false },
]

const INITIAL_VALUES = FIELDS.reduce((acc, { name }) => ({ ...acc, [name]: '' }), {})

// ponytail: basic shape check, not full RFC 5322 — good enough to catch typos client-side
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function FinalForm() {
  const { ref, visible } = useReveal()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

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

    setSubmitting(true)
    try {
      await submitLead({ ...values, source: 'full-form' })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section" id="quote">
      <div className={`final-form reveal ${visible ? 'reveal--visible' : ''}`} ref={ref}>
        <h2>Let&rsquo;s Plan a Corporate Event Your Guests Will Remember</h2>
        <p className="final-form__intro">
          Tell us a little about your event, and we&rsquo;ll recommend the right catering format
          and prepare a personalized quote.
        </p>

        {done ? (
          <div className="final-form__done state-swap-in">
            <span className="pill pill--on-light">
              Thanks — we&rsquo;ll follow up within 1 business day.
            </span>
          </div>
        ) : (
          <form className="final-form__form" onSubmit={handleSubmit} noValidate>
            <div className="final-form__grid">
              {FIELDS.map(({ name, label, type, options }) => (
                <div
                  className={`final-form__field${
                    type === 'textarea' ? ' final-form__field--full' : ''
                  }`}
                  key={name}
                >
                  <label htmlFor={`final-${name}`}>{label}</label>
                  {type === 'select' ? (
                    <select
                      id={`final-${name}`}
                      value={values[name]}
                      onChange={(e) => handleChange(name, e.target.value)}
                    >
                      <option value="" disabled>
                        Select a format
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
                    />
                  )}
                  {errors[name] && <span className="final-form__error">{errors[name]}</span>}
                </div>
              ))}
            </div>

            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Request a Corporate Quote'}
            </button>

            <p className="final-form__disclaimer">
              Submitting this form does not reserve your date. Your booking is confirmed after
              availability has been reviewed, the quote has been approved and the required
              deposit has been received.
            </p>

            <p className="final-form__contact">
              Prefer to speak with us? <a href="tel:416-613-0078">416-613-0078</a> ·{' '}
              <a href="mailto:info@miaso.ca">info@miaso.ca</a>
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
