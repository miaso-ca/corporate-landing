import { useState } from 'react'
import './Hero.css'
import heroPhoto from '../assets/photos/hero-table.jpg'
import valentinaIntro from '../assets/videos/valentina-intro.mp4'
import useReveal from '../hooks/useReveal.js'

// Real video landed 2026-09-28 (valentina-intro.mp4) — button restored.
const VIDEO_READY = true

export default function Hero({ onRequestQuote }) {
  // Above-the-fold: reveal on mount rather than waiting for scroll, staggered
  // so the eyebrow settles first, then the headline, then the card — a small
  // choreography instead of one flat fade.
  const eyebrow = useReveal({ immediate: true, delay: 100 })
  const headline = useReveal({ immediate: true, delay: 280 })
  const card = useReveal({ immediate: true, delay: 520 })

  // Olya, 2026-09-30: play the real video inline in the hero photo slot
  // instead of a popup modal, and don't pay for the 16MB download until
  // someone actually clicks play — the <video> tag isn't even in the DOM
  // (let alone fetched) until `playing` flips true.
  const [playing, setPlaying] = useState(false)

  return (
    <section className="hero" id="top">
      <div className="hero__frame">
        <div className="hero__photo">
          {playing ? (
            <>
              <video
                className="hero__photo-img"
                src={valentinaIntro}
                controls
                autoPlay
                playsInline
                onEnded={() => setPlaying(false)}
              />
              <button
                className="hero__video-close"
                onClick={() => setPlaying(false)}
                type="button"
                aria-label="Close video"
              >
                ×
              </button>
            </>
          ) : (
            <>
              <img
                src={heroPhoto}
                alt="MIASO catering spread, styled table"
                className="hero__photo-img"
              />
              <div className="hero__gradient" />
              <div className="hero__photo-content">
                <div className="hero__text-group">
                  <span
                    className={`pill pill--on-photo reveal reveal--fast ${
                      eyebrow.visible ? 'reveal--visible' : ''
                    }`}
                    ref={eyebrow.ref}
                  >
                    Catering in Toronto &amp;&nbsp;GTA
                  </span>
                  <h1
                    className={`hero__title reveal reveal--rise ${
                      headline.visible ? 'reveal--visible' : ''
                    }`}
                    ref={headline.ref}
                  >
                    Corporate Catering That Makes Hosting&nbsp;Effortless
                  </h1>
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
                    <button className="btn" type="button" onClick={onRequestQuote}>
                      Request a Corporate&nbsp;Quote
                    </button>
                    {VIDEO_READY && (
                      <button
                        className="hero__watch"
                        onClick={() => setPlaying(true)}
                        type="button"
                      >
                        <span className="hero__play">▶</span>
                        Watch 1:23
                      </button>
                    )}
                  </div>
                  <div className="hero__trust">
                    Made fresh to order · Flexible dietary options · Delivery, setup and staffed
                    service available
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
