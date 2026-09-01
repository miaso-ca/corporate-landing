import { useState } from 'react'
import Hero from './components/Hero.jsx'
import StatsBar from './components/StatsBar.jsx'
import CateringOptions from './components/CateringOptions.jsx'
import WhyMiaso from './components/WhyMiaso.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import SocialProof from './components/SocialProof.jsx'
import FAQ from './components/FAQ.jsx'
import FinalForm from './components/FinalForm.jsx'
import VideoModal from './components/VideoModal.jsx'

export default function App() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <>
      <Hero onWatchVideo={() => setVideoOpen(true)} />
      <StatsBar />
      <CateringOptions />
      <WhyMiaso />
      <HowItWorks />
      <SocialProof />
      <FAQ />
      <FinalForm />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </>
  )
}
