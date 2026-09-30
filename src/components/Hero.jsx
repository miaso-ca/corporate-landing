import { useState } from 'react'
import './Hero.css'
import videoPoster from '../assets/photos/hero-video-poster.jpg'
import valentinaIntro from '../assets/videos/valentina-intro.mp4'
import useReveal from '../hooks/useReveal.js'

function HeroVideo() {
  const [playing, setPlaying] = useState(false)
  const media = useReveal({ immediate: true, delay: 400 })

  return (
    <div className={`hero__media reveal ${media.visible ? 'reveal--visible' : ''}`} ref={media.ref}>
      <div className="hero__video">
        {playing ? (
          <video src={valentinaIntro} controls autoPlay playsInline onEnded={() => setPlaying(false)} />
        ) : (
          <button
            className="hero__video-play"
            onClick={() => setPlaying(true)}
            type="button"
            aria-label="Play video"
          >
            <img src={videoPoster} alt="" />
            <span className="hero__video-icon">▶</span>
          </button>
        )}
      </div>
      <span className="hero__video-caption">Meet the Founder · 1:23</span>
    </div>
  )
}

export default function Hero({ onRequestQuote }) {
  const eyebrow = useReveal({ immediate: true, delay: 100 })
  const headline = useReveal({ immediate: true, delay: 280 })
  const rest = useReveal({ immediate: true, delay: 460 })

  return (
    <section className="hero" id="top">
      <div className="hero__grid">
        <div className="hero__intro">
          <span
            className={`pill pill--on-light reveal reveal--fast ${
              eyebrow.visible ? 'reveal--visible' : ''
            }`}
            ref={eyebrow.ref}
          >
            Catering in Toronto &amp;&nbsp;GTA
          </span>
          <h1
            className={`hero__title reveal ${headline.visible ? 'reveal--visible' : ''}`}
            ref={headline.ref}
          >
            Corporate Catering That Makes Hosting&nbsp;Effortless
          </h1>

          <div className={`reveal ${rest.visible ? 'reveal--visible' : ''}`} ref={rest.ref}>
            <p className="hero__desc">
              From polished office lunches and client receptions to grazing tables, a staffed
              Mobile Cart and full-service events, MIASO delivers fresh food, thoughtful
              presentation and seamless support across Toronto and the GTA.
            </p>
            <div className="hero__actions">
              <button className="btn" type="button" onClick={onRequestQuote}>
                Request a Corporate&nbsp;Quote
              </button>
            </div>
            <div className="hero__trust">
              Made fresh to order · Flexible dietary options · Delivery, setup and staffed
              service available
            </div>
          </div>
        </div>

        <HeroVideo />
      </div>
    </section>
  )
}
