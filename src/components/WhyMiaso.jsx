import { useEffect, useState } from 'react'
import './WhyMiaso.css'
import useReveal from '../hooks/useReveal.js'
import photo1 from '../assets/photos/gallery/mixed-canapes-trio-spread.jpg'
import photo2 from '../assets/photos/gallery/tuna-tartare-cucumber-cups.jpg'
import photo3 from '../assets/photos/gallery/salmon-skewers-lime.jpg'
import photo4 from '../assets/photos/gallery/prosciutto-blackberry-brie-skewers.jpg'
import photo5 from '../assets/photos/gallery/cheese-skewers-mirror.jpg'

const CHECKLIST = [
  'Fresh food prepared to order',
  'A menu tailored to your event and guest count',
  'Dietary accommodations confirmed during planning',
  'Presentation and signage options matched to your event',
  'Delivery, setup, staffing and cleanup available depending on the package',
  'A clear quote with all services and inclusions defined upfront',
]

const PHOTOS = [
  { src: photo1, alt: 'Three MIASO canapé trays arranged together with a floral accent' },
  { src: photo2, alt: 'Tuna tartare served in cucumber cups with sesame and sprouts' },
  { src: photo3, alt: 'Grilled salmon skewers with a lime wheel garnish' },
  { src: photo4, alt: 'Prosciutto-wrapped brie skewers topped with blackberry' },
  { src: photo5, alt: 'Assorted cheese skewers with thyme sprigs' },
]

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function PhotoCarousel({ photos }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), 4000)
    return () => clearInterval(id)
  }, [photos.length])

  return (
    <div className="why-miaso__photo-frame">
      {photos.map((photo, i) => (
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`why-miaso__photo ${i === index ? 'why-miaso__photo--active' : ''}`}
        />
      ))}
      <div className="why-miaso__dots">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            aria-label={`Show photo ${i + 1}`}
            className={`why-miaso__dot ${i === index ? 'why-miaso__dot--active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}

export default function WhyMiaso() {
  const { ref, visible } = useReveal()
  return (
    <section
      className={`section reveal ${visible ? 'reveal--visible' : ''}`}
      id="why-miaso"
      ref={ref}
    >
      <h2 className="why-miaso__heading">
        You Manage the Event <span className="why-miaso__arrow">→</span> We Manage the Catering
        Details.
      </h2>

      <div className="why-miaso__intro">
        <p>
          Catering takes more than good food — timing, presentation, dietary needs, delivery,
          setup and service all have to align. MIASO picks the right format and coordinates it
          around your venue, guests and budget, so you can focus on hosting.
        </p>
      </div>

      <div className="why-miaso">
        <PhotoCarousel photos={PHOTOS} />

        <ul className="why-miaso__checklist">
          {CHECKLIST.map((item) => (
            <li key={item}>
              <span className="pill pill--on-light">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
