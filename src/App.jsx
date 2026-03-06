import React, { useState, useRef } from 'react'
import HeroSection from './components/HeroSection'
import Calculator from './components/Calculator'
import CasesSection from './components/CasesSection'
import CtaSection from './components/CtaSection'
import FormModal from './components/FormModal'
import './App.css'

function App() {
  const [roiModalOpen, setRoiModalOpen] = useState(false)
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const calcCallbackRef = useRef(null)

  const handleOpenForm = (callback) => {
    calcCallbackRef.current = callback
    setRoiModalOpen(true)
  }

  const handleRoiSuccess = (company) => {
    if (calcCallbackRef.current) {
      calcCallbackRef.current(company)
      calcCallbackRef.current = null
    }
  }

  const handlePdfCta = () => {
    window.print()
  }

  return (
    <div className="landing">
      <HeroSection />
      <Calculator onOpenForm={handleOpenForm} />
      <CasesSection />
      <CtaSection onOpenDemo={() => setDemoModalOpen(true)} onPdfCta={handlePdfCta} />
      <FormModal
        isOpen={roiModalOpen}
        onClose={() => setRoiModalOpen(false)}
        onSuccess={handleRoiSuccess}
        variant="roi"
      />
      <FormModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        variant="demo"
      />
    </div>
  )
}

export default App
