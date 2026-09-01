import { useState } from 'react'
import { submitLead } from '../lib/submitLead.js'
import './QuickCaptureForm.css'

const FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text' },
  { name: 'contact', label: 'Email or Phone', type: 'text' },
  { name: 'eventDate', label: 'Event Date', type: 'date' },
]

export default function QuickCaptureForm({ source }) {
  const [values, setValues] = useState({ name: '', contact: '', eventDate: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function handleChange(name, value) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  function validate() {
    const next = {}
    FIELDS.forEach(({ name, label }) => {
      if (!values[name].trim()) next[name] = `${label} is required`
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting || !validate()) return

    setSubmitting(true)
    try {
      await submitLead({ ...values, source })
      await new Promise((r) => setTimeout(r, 600))
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="quick-form quick-form--done state-swap-in">
        <span className="pill pill--on-light">Thanks — we'll follow up within 1 business day.</span>
      </div>
    )
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit} noValidate>
      {FIELDS.map(({ name, label, type }) => (
        <div className="quick-form__field" key={name}>
          <label htmlFor={`${source}-${name}`}>{label}</label>
          <input
            id={`${source}-${name}`}
            type={type}
            value={values[name]}
            onChange={(e) => handleChange(name, e.target.value)}
          />
          {errors[name] && <span className="quick-form__error">{errors[name]}</span>}
        </div>
      ))}
      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Get My Quote'}
      </button>
    </form>
  )
}
