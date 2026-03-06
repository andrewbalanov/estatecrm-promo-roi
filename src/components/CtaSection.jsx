import React from 'react'
import './CtaSection.css'

function CtaSection({ onOpenDemo, onPdfCta, pdfReady }) {
  return (
    <section className="cta-screen">
      <h2>Обсудим <em>проект?</em></h2>
      <p>На демо опишем план внедрения под вашу модель продаж</p>
      <div className="cta-btns">
        <button className="btn-cp" onClick={onOpenDemo}>
          Записаться на демо
        </button>
        <button className="btn-cs" onClick={onPdfCta} disabled={!pdfReady}
          style={!pdfReady ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}>
          Скачать отчёт в PDF
        </button>
      </div>
    </section>
  )
}

export default CtaSection
