import { useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import StatsBar from './components/StatsBar.jsx'
import CateringOptions from './components/CateringOptions.jsx'
import WhyMiaso from './components/WhyMiaso.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import SocialProof from './components/SocialProof.jsx'
import FAQ from './components/FAQ.jsx'
import FinalForm from './components/FinalForm.jsx'
import Footer from './components/Footer.jsx'
import VideoModal from './components/VideoModal.jsx'
import QuoteModal from './components/QuoteModal.jsx'
import StickyCta from './components/StickyCta.jsx'

export default function App() {
  const [videoOpen, setVideoOpen] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)

  return (
    <>
      <Nav onRequestQuote={() => setQuoteOpen(true)} />
      <Hero onWatchVideo={() => setVideoOpen(true)} onRequestQuote={() => setQuoteOpen(true)} />
      <StatsBar />
      <CateringOptions />
      <WhyMiaso />
      <HowItWorks onRequestQuote={() => setQuoteOpen(true)} />
      <SocialProof />
      <FAQ />
      <FinalForm />
      <Footer />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
      <StickyCta onRequestQuote={() => setQuoteOpen(true)} />
    </>
  )
}
