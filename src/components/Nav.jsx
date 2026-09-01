import { useEffect, useState } from 'react'
import './Nav.css'

const LINKS = [
  { href: '#catering-options', label: 'Catering' },
  { href: '#why-miaso', label: 'Why MIASO' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
]

export default function Nav() {
  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // ponytail: viewport-relative scroll threshold instead of an IntersectionObserver
    // sentinel — no coupling to Hero's markup, close enough to "past the hero photo".
    function onScroll() {
      setSolid(window.scrollY > window.innerHeight * 0.8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className={`nav ${solid ? 'nav--solid' : ''} ${menuOpen ? 'nav--open' : ''}`}>
      <div className="nav__bar">
        <a className="nav__logo" href="#top" onClick={closeMenu}>
          MIASO
        </a>

        <nav className="nav__links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <a className="nav__phone" href="tel:416-613-0078">
            416-613-0078
          </a>
          <a className="btn nav__cta" href="#quote">
            Request a Quote
          </a>
        </div>

        <button
          className="nav__toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="nav__mobile-panel" aria-hidden={!menuOpen}>
        <div className="nav__mobile-panel-inner">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={closeMenu}>
              {l.label}
            </a>
          ))}
          <a href="tel:416-613-0078" onClick={closeMenu}>
            416-613-0078
          </a>
          <a className="btn" href="#quote" onClick={closeMenu}>
            Request a Quote
          </a>
        </div>
      </div>
    </header>
  )
}
