import React from 'react'
import './CtaSection.css'

function CtaSection({ onDemoCta, onPdfCta }) {
  return (
    <section className="cta-screen">
      <h2>Обсудим <em>проект?</em></h2>
      <p>На демо опишем план внедрения под вашу модель продаж</p>
      <div className="cta-btns">
        <a href="https://estatecrm.io" className="btn-cp" target="_blank" rel="noopener noreferrer">
          Записаться на демо
        </a>
        <button className="btn-cs" onClick={onPdfCta}>
          Скачать отчёт в PDF
        </button>
      </div>
    </section>
  )
}

export default CtaSection
