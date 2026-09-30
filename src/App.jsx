import { useLayoutEffect, useRef, useState } from 'react'
import Nav from './components/Nav.jsx'
import HolidayBar from './components/HolidayBar.jsx'
import Hero from './components/Hero.jsx'
import StatsBar from './components/StatsBar.jsx'
import CateringOptions from './components/CateringOptions.jsx'
import WhyMiaso from './components/WhyMiaso.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import SocialProof from './components/SocialProof.jsx'
import FAQ from './components/FAQ.jsx'
import FinalForm from './components/FinalForm.jsx'
import Footer from './components/Footer.jsx'
import QuoteModal from './components/QuoteModal.jsx'
import StickyCta from './components/StickyCta.jsx'

export default function App() {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const topbarRef = useRef(null)

  // The Holiday bar changes the topbar's real height (present vs
  // dismissed, one line vs two on narrow screens) — every other layout
  // value that depends on nav height (Hero's top padding, every
  // section[id]'s scroll-margin-top) already reads the --nav-height CSS
  // var from tokens.css, so updating that one var here keeps them all
  // correct with no further wiring. Falls back to tokens.css's static
  // 84px default before this effect's first run.
  useLayoutEffect(() => {
    const node = topbarRef.current
    if (!node) return
    const setHeight = () => {
      document.documentElement.style.setProperty('--nav-height', `${node.offsetHeight}px`)
    }
    setHeight()
    const observer = new ResizeObserver(setHeight)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="topbar" ref={topbarRef}>
        <HolidayBar />
        <Nav onRequestQuote={() => setQuoteOpen(true)} />
      </div>
      <Hero onRequestQuote={() => setQuoteOpen(true)} />
      <StatsBar />
      <CateringOptions />
      <WhyMiaso />
      <HowItWorks onRequestQuote={() => setQuoteOpen(true)} />
      <SocialProof />
      <FAQ />
      <FinalForm />
      <Footer />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
      <StickyCta onRequestQuote={() => setQuoteOpen(true)} />
    </>
  )
}
