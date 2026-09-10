import './CateringOptions.css'
import QuickCaptureForm from './QuickCaptureForm.jsx'
import useReveal from '../hooks/useReveal.js'
import lunchesPhoto from '../assets/photos/catering-lunches-venue.jpg'
import grazingPhoto from '../assets/photos/catering-grazing-table.jpg'
import fullserviceTablePhoto from '../assets/photos/catering-fullservice-table.jpg'
import cupsLineupPhoto from '../assets/photos/catering-cups-lineup.jpg'

const OPTIONS = [
  {
    title: 'Boxed Lunches',
    description:
      'Individual lunch boxes, power bowls, grazing boats, cups and sharing platters for meetings, training days, staff appreciation and office celebrations.',
    bestFor: 'meetings, training days, office celebrations',
    photo: lunchesPhoto,
    // ponytail: portrait source is a wide venue shot with a tall angled
    // wood-beam ceiling over the top ~55% - the 16:9 crop can't include
    // both that and the food, so bias hard toward the bottom to show the
    // cheese board, caprese skewers, charcuterie platter and dip bowl.
    photoPosition: '50% 95%',
    alt: 'Cheese board, caprese skewers and charcuterie platter spread on wood tables in a modern venue',
  },
  {
    title: 'Shareable Platters',
    description:
      'Beautifully styled spreads featuring cheeses, charcuterie, seasonal fruit, artisanal breads and optional hot bites — ideal for networking events, client receptions and open houses.',
    bestFor: 'networking events, client receptions',
    photo: grazingPhoto,
    // ponytail: source has a shallow depth of field - flowers/sliders up
    // top are soft-focus, the sharp plane is lower (bread, blackberry-
    // prosciutto-brie bites, sushi). Bias down to the sharp food.
    photoPosition: '50% 85%',
    alt: 'Bread, blackberry-prosciutto-brie bites and sushi rolls on a grazing table',
  },
  {
    title: 'Individual Cups & Boats',
    description:
      'A fully refrigerated, staffed and styled food cart with charcuterie, salad or sandwich menus. A memorable focal point for conferences, expos, brand activations and company celebrations.',
    bestFor: 'conferences, expos, brand activations',
    // ponytail: client sent an even stronger shot - five cups lined up
    // instead of one, better conveys "corporate catering at scale".
    // Source is 3:2, close to 16:9 already, only ~10% crop needed.
    photo: cupsLineupPhoto,
    photoPosition: '50% 50%',
    alt: 'Five MIASO-branded kraft cups filled with charcuterie, cheese, fruit and breadsticks lined up in a row',
  },
  {
    title: 'Full-Service Catering',
    description:
      'Customized menus, delivery, setup, professional service and cleanup for conferences, galas, product launches, award nights and larger business events.',
    bestFor: 'galas, product launches, award nights',
    // ponytail: client sent a proper full-service action shot - staff
    // plating at a full outdoor table with a "BAR" sign visible in the
    // background, reads as "full-service" far better than a mobile cart.
    photo: fullserviceTablePhoto,
    photoPosition: '50% 50%',
    alt: 'MIASO staff member plating canapes at a full outdoor catering table with a bar station in the background',
  },
]

function BarCard({ delay }) {
  const { ref, visible } = useReveal({ delay })
  return (
    <div className={`catering-options__bar-card reveal ${visible ? 'reveal--visible' : ''}`} ref={ref}>
      <span className="pill pill--on-photo">Need Bar Service&nbsp;Too?</span>
      <p>
        We&rsquo;ve partnered with North Spirit Distillery for years to pair full bar
        service — bartenders, mixers and glassware — with every MIASO event. One
        booking, one point of contact — no juggling two vendors. Just mention it in
        the quote form below.
      </p>
    </div>
  )
}

function CateringCard({ option, delay }) {
  const { ref, visible } = useReveal({ delay })
  return (
    <div className={`catering-card reveal ${visible ? 'reveal--visible' : ''}`} ref={ref}>
      <div className="catering-card__photo">
        <img
          src={option.photo}
          alt={option.alt}
          loading="lazy"
          style={option.photoPosition ? { objectPosition: option.photoPosition } : undefined}
        />
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
        <BarCard delay={OPTIONS.length * 80} />
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
