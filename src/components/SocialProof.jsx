import { useEffect, useRef } from 'react'
import './SocialProof.css'
import useReveal from '../hooks/useReveal.js'
import clientVideo from '../assets/videos/client-event-clip.mp4'

function Reveal({ delay = 0, className = '', children }) {
  const { ref, visible } = useReveal({ delay })
  return (
    <div ref={ref} className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

function ClientVideo() {
  const videoRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videoRef.current?.pause()
    }
  }, [])

  return (
    <div className="social-proof__video">
      <video
        ref={videoRef}
        src={clientVideo}
        autoPlay
        muted
        loop
        playsInline
        aria-label="Behind-the-scenes footage from a MIASO corporate event"
      />
      <div className="social-proof__video-gradient" aria-hidden="true" />
      <span className="social-proof__video-caption">Behind the scenes at a MIASO event</span>
    </div>
  )
}

export default function SocialProof() {
  return (
    <div className="section-dark">
      <section className="section" id="social-proof">
        <Reveal>
          <h2>Trusted for Events That Need to Feel Polished, Welcoming and Well Organized</h2>
          <p className="social-proof__subhead">
            See how MIASO helps Toronto businesses create memorable experiences for their teams,
            clients and guests.
          </p>
        </Reveal>

        <Reveal delay={100} className="social-proof__top">
          <ClientVideo />
          <div className="social-proof__reviews">
            {[0, 1, 2].map((i) => (
              <div className="review-card slot-card" key={i}>
                <span className="review-card__stars" aria-hidden="true">☆☆☆☆☆</span>
                <span className="slot-card__caption">Reviews coming soon</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200} className="social-proof__logos slot-card">
          <div className="logos-strip" aria-hidden="true">
            <span className="logos-strip__mark" />
            <span className="logos-strip__mark" />
            <span className="logos-strip__mark" />
            <span className="logos-strip__mark" />
            <span className="logos-strip__mark" />
          </div>
          <span className="slot-card__caption">Client logos coming soon</span>
        </Reveal>
      </section>
    </div>
  )
}
