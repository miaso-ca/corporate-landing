import { useEffect, useRef, useState } from 'react'
import './SocialProof.css'
import useReveal from '../hooks/useReveal.js'
import clientVideo from '../assets/videos/client-event-clip.mp4'

const REVIEWS = [
  {
    name: 'Ulyana',
    text: 'I ordered catering for an event with 50 guests and had a great experience. Everything was organized very professionally and smoothly. The team took care of all the details, which allowed me to relax before the event and not worry about the preparations. During the celebration I also felt completely at ease because everything was handled by such a professional team. The event turned out amazing and everything was done at the highest level. Highly recommend!',
  },
  {
    name: 'Nicole Kolodii',
    text: 'I had an amazing experience with MIASO catering! The food was absolutely delicious, beautifully presented, and made with high-quality ingredients. Every dish was fresh, flavorful, and thoughtfully prepared. The service was professional, and very attentive to details. The team made everything stress-free. MIASO truly exceeded expectations and added a special touch to our event. I highly recommend them to anyone looking for exceptional catering services. We will definitely book them again!',
  },
  {
    name: 'Lauren Mitchell',
    text: 'MIASO catered a team appreciation event at our Toronto office, and everything was excellent. The menu offered plenty of variety, the food arrived fresh and on time, and the setup looked polished. Our entire team had wonderful things to say.',
  },
  {
    name: 'Ulyana Nepelyak',
    text: 'I highly recommend this service! Everything was absolutely delicious and all my guests loved the catering. Thank you MIASO Catering for making my event so special!!!',
  },
  {
    name: 'Rachel Thompson',
    text: 'From the first conversation, MIASO understood exactly what we wanted for our engagement celebration. The team was responsive, organized, and attentive to every detail. The food looked beautiful, tasted incredible, and made the evening feel genuinely special.',
  },
  {
    name: 'Kristina Miroshnichenko',
    text: 'Stylish, elegant, and incredibly tasty. The presentation was beautiful, the food was fresh and flavorful, and everything arrived perfectly prepared. Highly recommend!',
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
  {
    name: 'Richa Roy',
    text: 'Miaso’s grazing platters and gift boxes are perfect for spoiling loved ones or yourself, no judgement here. We tried their solo box and fell in love — you could definitely taste the freshness of each ingredient! From a curated selection of artisan meats to fine cheeses and even crackers, this box had it all. Valentina really is passionate about creating an experience. With catering, charcuterie carts and much more, MIASO has countless options to make your event memorable — highly recommended!',
  },
  {
    name: 'Anyuta',
    text: 'I had a very pleasant experience working with them! Everything was organized professionally and smoothly. The event turned out wonderful, and the guests absolutely loved the charcuterie bar — it looked beautiful and tasted amazing. Thank you for the great service and atmosphere. I would definitely work with you again!',
  },
  {
    name: 'Sviatoslav Vyshnevskyi',
    text: 'We had an amazing experience with MIASO Catering! Valentina and her team did an incredible job from start to finish. The food was absolutely delicious, beautifully presented, and everything was handled with such professionalism and care. Highly recommend Valentina and her team if you’re looking for quality, reliability, and great service.',
  },
  {
    name: 'Olgacontect',
    text: 'I ordered catering for my birthday party for 30 people, and it was honestly the best decision! Everything was incredibly delicious, fresh, and beautifully presented. My guests kept asking where the food was from because they loved it so much. The service was also amazing — everything was organized perfectly and delivered on time. It made my celebration completely stress-free. Highly recommend!',
  },
  {
    name: 'Dilia Iavari',
    text: 'Incredible experience! The menu variety was impressive and every dish was seasoned to perfection. It’s rare to find catering where the food tastes just as good as it looks, but they nailed it. Everything arrived on time, hot and delicious. They really elevated our event and I can’t wait to work with them again!',
  },
  {
    name: 'Olya Stefurak',
    text: 'Extremely pleasant experience working with MIASO. Everything was fresh, the delivery was fast and they were really helpful in answering all my questions. Highly recommend!',
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
  // Was `autoPlay` on the <video> tag itself, which starts downloading the
  // full 3MB file the instant this component mounts - on initial page
  // load, same wave as the Hero poster/JS/CSS, even though this section is
  // several screens below the fold. Gate playback (and preload) behind the
  // same scroll-reveal IntersectionObserver every other section already
  // uses, so the download only starts once a visitor actually scrolls here.
  const { ref, visible } = useReveal()

  useEffect(() => {
    if (!visible) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    videoRef.current?.play().catch(() => {})
  }, [visible])

  return (
    <div className="social-proof__video" ref={ref}>
      <video
        ref={videoRef}
        src={clientVideo}
        preload="none"
        muted
        loop
        playsInline
        aria-label="Behind-the-scenes footage from a MIASO corporate event"
      />
      <div className="social-proof__video-gradient" aria-hidden="true" />
      <span className="social-proof__video-caption">Behind the scenes at a MIASO&nbsp;event</span>
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
                <div className="review-card__meta">
                  <span className="review-card__stars" aria-hidden="true">★★★★★</span>
                  <span className="review-card__source">Google review</span>
                </div>
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
