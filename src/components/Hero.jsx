import './Hero.css'
import heroPhoto from '../assets/photos/hero-table.jpg'

export default function Hero({ onWatchVideo }) {
  return (
    <section className="hero">
      <div className="hero__frame">
        <div className="hero__photo">
          <img src={heroPhoto} alt="MIASO catering spread, styled table" />
          <div className="hero__gradient" />
          <div className="hero__photo-content">
            <span className="pill pill--on-photo">Corporate Catering · Toronto &amp; GTA</span>
            <h1 className="hero__title">
              Corporate Catering in Toronto That Makes Hosting Effortless
            </h1>
          </div>
        </div>

        <div className="hero__card">
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
