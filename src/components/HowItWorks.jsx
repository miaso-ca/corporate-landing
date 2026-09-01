import QuickCaptureForm from './QuickCaptureForm.jsx'
import useReveal from '../hooks/useReveal.js'
import './HowItWorks.css'

const STEPS = [
  {
    title: 'Tell Us About Your Event',
    desc: 'Share your preferred date, venue, guest count, budget, event format and dietary requirements.',
  },
  {
    title: 'Receive a Tailored Recommendation',
    desc: "We'll recommend the most suitable catering format and prepare a personalized menu and quote.",
  },
  {
    title: 'Confirm the Details',
    desc: 'Approve the menu and service package. Your date is reserved once availability is confirmed and the required deposit is received.',
  },
  {
    title: 'Enjoy Your Event',
    desc: 'Depending on your selected package, the MIASO team will prepare, deliver, style, serve and clean up.',
  },
]

export default function HowItWorks() {
  const { ref, visible } = useReveal()
  return (
    <section
      className={`section reveal ${visible ? 'reveal--visible' : ''}`}
      id="how-it-works"
      ref={ref}
    >
      <h2>From Your Brief to a Beautifully Served Event</h2>
      <div className="how-it-works__steps">
        {STEPS.map((step, i) => (
          <div className="how-it-works__step" key={step.title}>
            <span className="how-it-works__number">{String(i + 1).padStart(2, '0')}</span>
            <div className="how-it-works__copy">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <a className="btn how-it-works__cta" href="#quote">Request a Corporate Quote</a>
      <QuickCaptureForm source="block-5" />
    </section>
  )
}
