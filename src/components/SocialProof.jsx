import { useEffect, useRef, useState } from 'react'
import './SocialProof.css'
import useReveal from '../hooks/useReveal.js'
import clientVideo from '../assets/videos/client-event-clip.mp4'

const REVIEWS = [
  {
    name: 'Emily Carter',
    text: 'MIASO made our corporate reception feel effortless. The food was fresh, beautifully presented, and thoughtfully prepared for different dietary needs. Their team was professional from setup to cleanup, and several guests asked us who handled the catering.',
  },
  {
    name: 'Olivia Bennett',
    text: 'We hired MIASO for a family celebration and couldn’t have been happier. Every dish was flavourful, the presentation was elegant, and the team handled all the details seamlessly. We were able to relax and truly enjoy the evening with our guests.',
  },
  {
    name: 'Lauren Mitchell',
    text: 'MIASO catered a team appreciation event at our Toronto office, and everything was excellent. The menu offered plenty of variety, the food arrived fresh and on time, and the setup looked polished. Our entire team had wonderful things to say.',
  },
  {
    name: 'Rachel Thompson',
    text: 'From the first conversation, MIASO understood exactly what we wanted for our engagement celebration. The team was responsive, organized, and attentive to every detail. The food looked beautiful, tasted incredible, and made the evening feel genuinely special.',
  },
  {
    name: 'Daniel Brooks',
    text: 'MIASO delivered an exceptional experience for our client dinner. The menu felt refined yet approachable, the presentation was impressive, and the service was attentive without being intrusive. Everything came together beautifully and left a strong impression on our guests.',
  },
  {
    name: 'Michael Anderson',
    text: 'Excellent food, thoughtful service, and seamless coordination from start to finish. MIASO accommodated our guests’ dietary preferences and made sure everything arrived fresh and on time. The setup was beautiful, and the entire event felt relaxed and well organized.',
  },
  {
    name: 'James Wilson',
    text: 'Our guests are still talking about the food. Every dish was full of flavour and presented with care. The MIASO team was friendly, flexible, and professional throughout the event. They helped create a warm and memorable experience for everyone.',
  },
]
const REVIEWS_PER_PAGE = 3

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

function useReviewsPage() {
  const [page, setPage] = useState(0)
  const pageCount = Math.ceil(REVIEWS.length / REVIEWS_PER_PAGE)
  return {
    page,
    pageCount,
    visible: REVIEWS.slice(page * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE + REVIEWS_PER_PAGE),
    prev: () => setPage((p) => (p - 1 + pageCount) % pageCount),
    next: () => setPage((p) => (p + 1) % pageCount),
  }
}

export default function SocialProof() {
  const { visible, pageCount, page, prev, next } = useReviewsPage()

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
            {visible.map((r) => (
              <div className="review-card slot-card" key={r.name}>
                <span className="review-card__name">{r.name}</span>
                <p className="review-card__text">{r.text}</p>
                <span className="review-card__stars" aria-hidden="true">★★★★★</span>
              </div>
            ))}
          </div>
        </Reveal>

        {pageCount > 1 && (
          <div className="social-proof__reviews-nav">
            <button type="button" aria-label="Previous reviews" onClick={prev}>
              ‹
            </button>
            <div className="social-proof__reviews-dots">
              {Array.from({ length: pageCount }).map((_, i) => (
                <span
                  key={i}
                  className={`social-proof__reviews-dot ${
                    i === page ? 'social-proof__reviews-dot--active' : ''
                  }`}
                />
              ))}
            </div>
            <button type="button" aria-label="Next reviews" onClick={next}>
              ›
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
