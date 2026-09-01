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
        <a className="footer__logo" href="#top">
          MIASO
        </a>

        <nav className="footer__links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="footer__contact">
          <a href="tel:416-613-0078">416-613-0078</a>
          <a href="mailto:info@miaso.ca">info@miaso.ca</a>
        </div>

        <p className="footer__tagline">Toronto &amp; GTA · Corporate Catering</p>
        <p className="footer__copyright">© 2026 MIASO. All rights reserved.</p>
      </div>
    </footer>
  )
}
