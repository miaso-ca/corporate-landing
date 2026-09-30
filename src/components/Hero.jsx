import { useState } from 'react'
import './Hero.css'
import heroPhoto from '../assets/photos/hero-table.jpg'
import videoPoster from '../assets/photos/hero-video-poster.jpg'
import valentinaIntro from '../assets/videos/valentina-intro.mp4'
import useReveal from '../hooks/useReveal.js'

// Real video landed 2026-09-28 (valentina-intro.mp4) — button restored.
const VIDEO_READY = true

function VideoScreen() {
  const [playing, setPlaying] = useState(false)
  const screen = useReveal({ immediate: true, delay: 400 })

  return (
    <div
      className={`hero__video-screen reveal ${screen.visible ? 'reveal--visible' : ''}`}
      ref={screen.ref}
    >
      <span className="pill pill--on-photo hero__video-screen-badge">Meet&nbsp;Valentina</span>
      {playing ? (
        <video src={valentinaIntro} controls autoPlay playsInline onEnded={() => setPlaying(false)} />
      ) : (
        <button
          className="hero__video-screen-play"
          onClick={() => setPlaying(true)}
          type="button"
          aria-label="Play video"
        >
          <img src={videoPoster} alt="" />
          <span className="hero__video-screen-icon">▶</span>
        </button>
      )}
    </div>
  )
}

export default function Hero({ onWatchVideo, onRequestQuote }) {
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

          {/* ponytail: 2026-09-29 test per Serhii/Olya reference — video as
              its own floating "screen" card on the hero photo, independent
              of the existing text/CTA card and its own Watch-button+modal
              flow below (left untouched so this is purely additive and easy
              to remove if the test doesn't land). */}
          <VideoScreen />

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
                  <button className="hero__watch" onClick={onWatchVideo} type="button">
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
        </div>
      </div>
    </section>
  )
}
