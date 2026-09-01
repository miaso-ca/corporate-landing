import './Hero.css'
import heroPhoto from '../assets/photos/hero-table.jpg'
import useReveal from '../hooks/useReveal.js'

export default function Hero({ onWatchVideo }) {
  // Above-the-fold: reveal on mount rather than waiting for scroll, staggered
  // so the eyebrow settles first, then the headline, then the card — a small
  // choreography instead of one flat fade.
  const eyebrow = useReveal({ immediate: true, delay: 100 })
  const headline = useReveal({ immediate: true, delay: 280 })
  const card = useReveal({ immediate: true, delay: 520 })

  return (
    <section className="hero" id="top">
      <div className="hero__frame">
        <div className="hero__photo">
          <img
            src={heroPhoto}
            alt="MIASO catering spread, styled table"
            className="hero__photo-img"
          />
          <div className="hero__gradient" />
          <div className="hero__photo-content">
            <span
              className={`pill pill--on-photo reveal reveal--fast ${
                eyebrow.visible ? 'reveal--visible' : ''
              }`}
              ref={eyebrow.ref}
            >
              Corporate Catering · Toronto &amp; GTA
            </span>
            <h1
              className={`hero__title reveal reveal--rise ${
                headline.visible ? 'reveal--visible' : ''
              }`}
              ref={headline.ref}
            >
              Corporate Catering in Toronto That Makes Hosting Effortless
            </h1>
          </div>
        </div>

        <div
          className={`hero__card reveal ${card.visible ? 'reveal--visible' : ''}`}
          ref={card.ref}
        >
          <p className="hero__desc">
            From polished office lunches and client receptions to grazing tables, a staffed
            Mobile Cart and full-service events, MIASO delivers fresh food, thoughtful
            presentation and seamless support across Toronto and the GTA.
          </p>
          <div className="hero__actions">
            <a className="btn" href="#quote">Request a Corporate Quote</a>
            <button className="hero__watch" onClick={onWatchVideo} type="button">
              <span className="hero__play">▶</span>
              Watch 45 sec
            </button>
          </div>
          <div className="hero__trust">
            Made fresh to order · Flexible dietary options · Delivery, setup and staffed
            service available
          </div>
        </div>
      </div>
    </section>
  )
}
