import { useEffect, useState } from 'react'
import './StickyCta.css'

export default function StickyCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // ponytail: same viewport-relative threshold Nav.jsx uses for its solid
    // state — kept as an independent listener rather than shared state, this
    // component only needs the boolean, not Nav's internals.
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`sticky-cta ${visible ? 'sticky-cta--visible' : ''}`} aria-hidden={!visible}>
      <a className="btn sticky-cta__btn" href="#quote">
        Request a Corporate Quote
      </a>
    </div>
  )
}
