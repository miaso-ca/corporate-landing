import './CateringOptions.css'
import QuickCaptureForm from './QuickCaptureForm.jsx'
import useReveal from '../hooks/useReveal.js'
import lunchesPhoto from '../assets/photos/catering-lunches.jpg'
import grazingPhoto from '../assets/photos/catering-grazing.jpg'
import cartPhoto from '../assets/photos/gallery/staff-serving-canapes-smile.jpg'
import fullservicePhoto from '../assets/photos/catering-fullservice.jpg'

const OPTIONS = [
  {
    title: 'Corporate Lunches & Drop-Off Catering',
    description:
      'Individual lunch boxes, power bowls, grazing boats, cups and sharing platters for meetings, training days, staff appreciation and office celebrations.',
    bestFor: 'meetings, training days, office celebrations',
    photo: lunchesPhoto,
    alt: 'Individually styled catering cups ready for drop-off',
  },
  {
    title: 'Grazing Tables',
    description:
      'Beautifully styled spreads featuring cheeses, charcuterie, seasonal fruit, artisanal breads and optional hot bites — ideal for networking events, client receptions and open houses.',
    bestFor: 'networking events, client receptions',
    photo: grazingPhoto,
    alt: 'Grazing table spread with cheeses, breads and canapés',
  },
  {
    title: 'Mobile Cart Experience',
    description:
      'A fully refrigerated, staffed and styled food cart with charcuterie, salad or sandwich menus. A memorable focal point for conferences, expos, brand activations and company celebrations.',
    bestFor: 'conferences, expos, brand activations',
    photo: cartPhoto,
    alt: 'MIASO catering staff member serving a tray of canapés at an outdoor event',
  },
  {
    title: 'Full-Service Corporate Catering',
    description:
      'Customized menus, delivery, setup, professional service and cleanup for conferences, galas, product launches, award nights and larger business events.',
    bestFor: 'galas, product launches, award nights',
    photo: fullservicePhoto,
    alt: 'Full-service buffet spread set for a corporate event',
  },
]

function CateringCard({ option, delay }) {
  const { ref, visible } = useReveal({ delay })
  return (
    <div className={`catering-card reveal ${visible ? 'reveal--visible' : ''}`} ref={ref}>
      <div className="catering-card__photo">
        <img src={option.photo} alt={option.alt} loading="lazy" />
      </div>
      <h3 className="catering-card__title">{option.title}</h3>
      <p className="catering-card__desc">{option.description}</p>
      <span className="pill pill--on-light catering-card__best-for">Best for: {option.bestFor}</span>
    </div>
  )
}

export default function CateringOptions() {
  const { ref, visible } = useReveal()
  return (
    <section
      className={`section reveal ${visible ? 'reveal--visible' : ''}`}
      id="catering-options"
      ref={ref}
    >
      <h2>One Catering Partner for Every Corporate Occasion</h2>
      <p className="catering-options__intro">
        Whether you are planning a boardroom lunch, client reception, conference or company
        celebration, MIASO can tailor the menu, presentation and level of service to your event.
      </p>

      <div className="catering-options__grid">
        {OPTIONS.map((option, i) => (
          <CateringCard option={option} delay={i * 80} key={option.title} />
        ))}
      </div>

      <div className="catering-options__callout">
        <div className="catering-options__callout-copy">
          <span className="pill pill--on-photo">Need Bar Service Too?</span>
          <p>
            We&rsquo;ve partnered with North Spirit Distillery for years to pair full bar
            service — bartenders, mixers and glassware — with every MIASO event, so nothing
            about your day feels stitched together.
          </p>
        </div>
        <a className="btn catering-options__callout-btn" href="#quote">
          Ask About Bar Service
        </a>
      </div>

      <div className="catering-options__quote">
        <h3>Let&rsquo;s Get You a Quote</h3>
        <p className="catering-options__quote-intro">
          Share your details and we&rsquo;ll follow up within 1 business day. Have your guest
          count, budget or venue ready? <a href="#quote">Use the full quote form</a> instead.
        </p>
        <QuickCaptureForm source="block-3" />
      </div>
    </section>
  )
}
