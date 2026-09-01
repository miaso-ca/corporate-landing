import './CateringOptions.css'
import QuickCaptureForm from './QuickCaptureForm.jsx'
import lunchesPhoto from '../assets/photos/catering-lunches.jpg'
import grazingPhoto from '../assets/photos/catering-grazing.jpg'
import cartPhoto from '../assets/photos/catering-cart.jpg'
import fullservicePhoto from '../assets/photos/catering-fullservice.jpg'

const OPTIONS = [
  {
    title: 'Corporate Lunches & Drop-Off Catering',
    description:
      'Individual lunch boxes, power bowls, grazing boats, cups and sharing platters for meetings, training days, staff appreciation and office celebrations.',
    photo: lunchesPhoto,
    alt: 'Individually styled catering cups ready for drop-off',
  },
  {
    title: 'Grazing Tables',
    description:
      'Beautifully styled spreads featuring cheeses, charcuterie, seasonal fruit, artisanal breads and optional hot bites — ideal for networking events, client receptions and open houses.',
    photo: grazingPhoto,
    alt: 'Grazing table spread with cheeses, breads and canapés',
  },
  {
    title: 'Mobile Cart Experience',
    description:
      'A fully refrigerated, staffed and styled food cart with charcuterie, salad or sandwich menus. A memorable focal point for conferences, expos, brand activations and company celebrations.',
    photo: cartPhoto,
    alt: 'Styled cheese and charcuterie presentation',
  },
  {
    title: 'Full-Service Corporate Catering',
    description:
      'Customized menus, delivery, setup, professional service and cleanup for conferences, galas, product launches, award nights and larger business events.',
    photo: fullservicePhoto,
    alt: 'Full-service buffet spread set for a corporate event',
  },
]

export default function CateringOptions() {
  return (
    <section className="section" id="catering-options">
      <h2>One Catering Partner for Every Corporate Occasion</h2>
      <p className="catering-options__intro">
        Whether you are planning a boardroom lunch, client reception, conference or company
        celebration, MIASO can tailor the menu, presentation and level of service to your event.
      </p>

      <div className="catering-options__grid">
        {OPTIONS.map((option) => (
          <div className="catering-card" key={option.title}>
            <div className="catering-card__photo">
              <img src={option.photo} alt={option.alt} loading="lazy" />
            </div>
            <h3 className="catering-card__title">{option.title}</h3>
            <p className="catering-card__desc">{option.description}</p>
          </div>
        ))}
      </div>

      <div className="catering-options__callout">
        <span className="pill pill--on-light">Need Bar Service Too?</span>
        <p>
          Combine MIASO catering with North Spirit Distillery bar service through one
          coordinated booking.
        </p>
      </div>

      <div className="catering-options__cta">
        <a className="btn" href="#quote">Request a Corporate Quote</a>
      </div>

      <QuickCaptureForm source="block-3" />
    </section>
  )
}
