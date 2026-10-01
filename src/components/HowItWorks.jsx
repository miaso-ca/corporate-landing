import './HowItWorks.css'

const STEPS = [
  {
    title: 'Tell Us About Your Event',
    desc: 'Share your preferred date, venue, guest count, budget, event format and dietary requirements.',
  },
  {
    title: 'Receive a Tailored Recommendation',
    desc: "We'll recommend the most suitable catering format and prepare a personalized menu and quote.",
  },
  {
    title: 'Confirm the Details',
    desc: 'Approve the menu and service package. Your date is reserved once availability is confirmed and the required deposit is received.',
  },
  {
    title: 'Enjoy Your Event',
    desc: 'Depending on your selected package, the MIASO team will prepare, deliver, style, serve and clean up.',
  },
]

export default function HowItWorks({ onRequestQuote }) {
  // No reveal wrapper here on purpose - see CateringOptions.jsx for the
  // full explanation. This section (intro + 4 steps) was tall enough that
  // the whole-section IntersectionObserver didn't reliably clear its 0.15
  // threshold right after it came into view.

  return (
    <section className="section" id="how-it-works">
      <div className="how-it-works__panel">
        <h2>From Your Brief to a Beautifully Served Event</h2>
        <p className="how-it-works__intro">
          Every MIASO corporate event runs on the same process, from your first message to the
          last tray cleared — no guesswork, no surprises on the day:
        </p>

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

        <button className="btn how-it-works__cta" type="button" onClick={onRequestQuote}>
          Request a Corporate&nbsp;Quote
        </button>
      </div>
    </section>
  )
}
