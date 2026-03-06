import React, { useState, useRef } from 'react'
import HeroSection from './components/HeroSection'
import Calculator from './components/Calculator'
import CasesSection from './components/CasesSection'
import CtaSection from './components/CtaSection'
import FormModal from './components/FormModal'
import './App.css'

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const calcCallbackRef = useRef(null)

  const handleOpenForm = (callback) => {
    calcCallbackRef.current = callback
    setModalOpen(true)
  }

  const handleFormSuccess = (company) => {
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
      <CtaSection onPdfCta={handlePdfCta} />
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

export default App
