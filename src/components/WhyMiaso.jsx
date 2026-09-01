import './WhyMiaso.css'
import useReveal from '../hooks/useReveal.js'

const CHECKLIST = [
  'Fresh food prepared to order',
  'A menu tailored to your event and guest count',
  'Dietary accommodations confirmed during planning',
  'Presentation and signage options matched to your event',
  'Delivery, setup, staffing and cleanup available depending on the package',
  'A clear quote with all services and inclusions defined upfront',
]

export default function WhyMiaso() {
  const { ref, visible } = useReveal()
  return (
    <section
      className={`section reveal ${visible ? 'reveal--visible' : ''}`}
      id="why-miaso"
      ref={ref}
    >
      <div className="why-miaso">
        <div className="why-miaso__text">
          <h2>You Manage the Event. We Manage the Catering Details.</h2>
          <p>
            Corporate catering involves more than choosing food. Timing, presentation, dietary
            requirements, delivery, setup and service all need to work together.
          </p>
          <p>
            MIASO helps you select the right format and coordinates the catering around your
            schedule, venue, guests and budget — so you can focus on hosting.
          </p>
        </div>

        <ul className="why-miaso__checklist">
          {CHECKLIST.map((item) => (
            <li key={item}>
              <span className="pill pill--on-light">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
