import './Footer.css'

const LINKS = [
  { href: '#catering-options', label: 'Catering' },
  { href: '#why-miaso', label: 'Why MIASO' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
  { href: '#quote', label: 'Get a Quote' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__col footer__col--brand">
          <a className="footer__logo" href="#top">
            MIASO
          </a>
          <p className="footer__tagline">Toronto &amp; GTA · Corporate Catering</p>
        </div>

        <div className="footer__col">
          <span className="footer__col-title">Explore</span>
          <nav className="footer__links">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="footer__col">
          <span className="footer__col-title">Contact</span>
          <div className="footer__contact">
            <a href="tel:416-613-0078">416-613-0078</a>
            <a href="mailto:info@miaso.ca">info@miaso.ca</a>
          </div>

          <div className="footer__social">
            <a
              href="https://www.instagram.com/miaso.ca"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MIASO on Instagram"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/share/18Ynd3VjEQ/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MIASO on Facebook"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M15 8.5h-2a1.5 1.5 0 0 0-1.5 1.5v2H15l-.5 3H11.5v6h-3v-6H6v-3h2.5v-2.3A4.2 4.2 0 0 1 12.9 5H15v3.5Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">© 2026 MIASO. All rights reserved.</p>
      </div>
    </footer>
  )
}
