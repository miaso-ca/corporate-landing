import { Fragment, useState } from 'react'
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
  { name: 'eventDate', label: 'Event Date', type: 'date', required: false, group: 'Event Details' },
  { name: 'guests', label: 'Number of Guests', type: 'number', required: true },
  { name: 'venue', label: 'Venue or Location', type: 'text', required: false },
  { name: 'budget', label: 'Approximate Budget', type: 'select', required: true, options: BUDGET_RANGES },
  { name: 'format', label: 'Preferred Catering Format', type: 'select', required: true, options: CATERING_FORMATS },
  { name: 'dietary', label: 'Dietary Requirements', type: 'textarea', required: false, group: 'Anything Else?' },
  { name: 'details', label: 'Additional Details', type: 'textarea', required: false },
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

    setSubmitting(true)
    setSubmitError('')
    try {
      await submitLead({ ...values, source: 'full-form' })
      setDone(true)
    } catch (err) {
      setSubmitError('Something went wrong — please try again, or call us at 416-613-0078.')
    } finally {
      setSubmitting(false)
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
            <div className="final-form__grid">
              {FIELDS.map(({ name, label, type, options, group }) => (
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
              Prefer to speak with us? <a href="tel:416-613-0078">416-613-0078</a> ·{' '}
              <a href="mailto:info@miaso.ca">info@miaso.ca</a>
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
