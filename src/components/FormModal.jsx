import React, { useState } from 'react'
import './FormModal.css'

const VARIANTS = {
  roi: {
    title: 'Ваш персональный расчёт готов',
    subtitle: 'Оставьте контакты — мы пришлём PDF и свяжемся для обсуждения проекта',
    button: 'Показать расчёт',
    successTitle: 'Заявка отправлена!',
    successText: 'Мы свяжемся с вами в ближайшее время. Ваш расчёт готов — нажмите кнопку ниже.',
    successButton: 'Перейти к расчёту',
    source: 'ROI',
  },
  demo: {
    title: 'Записаться на демо',
    subtitle: 'Оставьте контакты — мы свяжемся и покажем возможности EstateCRM под вашу модель продаж',
    button: 'Записаться на демо',
    successTitle: 'Заявка отправлена!',
    successText: 'Мы свяжемся с вами в ближайшее время для согласования даты демонстрации.',
    successButton: 'Закрыть',
    source: 'Demo',
  },
}

function FormModal({ isOpen, onClose, onSuccess, variant = 'roi' }) {
  const cfg = VARIANTS[variant]
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    consent: true,
    marketing: true,
  })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/roi/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          source: cfg.source,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setStatus('success')
      } else {
        setErrorMsg('Не удалось отправить заявку. Попробуйте ещё раз.')
        setStatus('error')
      }
    } catch (err) {
      console.error('Submit error:', err)
      setStatus('success')
    }
  }

  const handleSuccessAction = () => {
    const company = form.company
    resetForm()
    onClose()
    if (variant === 'roi' && onSuccess) {
      onSuccess(company)
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setErrorMsg('')
    setForm({ name: '', company: '', email: '', phone: '', consent: true, marketing: true })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal__header">
          <button className="modal__close" onClick={handleClose} type="button">&times;</button>
          <h2 className="modal__title">{cfg.title}</h2>
          <p className="modal__subtitle">{cfg.subtitle}</p>
        </div>

        {status === 'success' ? (
          <div className="modal__body">
            <div className="modal__success">
              <div className="modal__success-icon">&#10003;</div>
              <h3>{cfg.successTitle}</h3>
              <p>{cfg.successText}</p>
              <button className="modal__submit" type="button" onClick={handleSuccessAction}>
                {cfg.successButton}
              </button>
            </div>
          </div>
        ) : (
          <form className="modal__body" onSubmit={handleSubmit}>
            <div className="modal__field">
              <label className="modal__label">Имя <span>*</span></label>
              <input
                className="modal__input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={status === 'loading'}
              />
            </div>
            <div className="modal__field">
              <label className="modal__label">Название компании <span>*</span></label>
              <input
                className="modal__input"
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                required
                disabled={status === 'loading'}
              />
            </div>
            <div className="modal__field">
              <label className="modal__label">Рабочая почта <span>*</span></label>
              <input
                className="modal__input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={status === 'loading'}
              />
            </div>
            <div className="modal__field">
              <label className="modal__label">Телефон <span>*</span></label>
              <input
                className="modal__input"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                disabled={status === 'loading'}
              />
            </div>

            <label className="modal__checkbox">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
              <span>Согласие на обработку <a href="#">персональных данных</a></span>
            </label>
            <label className="modal__checkbox">
              <input
                type="checkbox"
                name="marketing"
                checked={form.marketing}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
              <span>Хочу получать email с новыми кейсами, рекламой и <a href="#">быть в курсе важных событий</a></span>
            </label>

            {status === 'error' && (
              <p className="modal__error">{errorMsg}</p>
            )}

            <button className="modal__submit" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Отправка...' : cfg.button}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default FormModal
