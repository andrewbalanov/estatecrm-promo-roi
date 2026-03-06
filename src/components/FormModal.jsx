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
    button: 'Отправить заявку',
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
    lastName: '',
    company: '',
    phone: '',
    email: '',
  })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const { name, phone, email } = form
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Пожалуйста, заполните Имя, Телефон и E-mail')
      return
    }

    setStatus('loading')

    try {
      const fullName = [form.name, form.lastName].filter(Boolean).join(' ')

      await fetch('/roi/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          company: form.company,
          email: form.email,
          phone: form.phone,
          source: cfg.source,
        }),
      })

      setStatus('success')
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
    setForm({ name: '', lastName: '', company: '', phone: '', email: '' })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  return (
    <div className="mo on" onClick={handleOverlayClick}>
      <div className="mb">
        <button className="mc" onClick={handleClose} type="button">&times;</button>

        {status === 'success' ? (
          <div className="modal-success">
            <div className="modal-success-icon">&#10003;</div>
            <div className="mt">{cfg.successTitle}</div>
            <p className="modal-success-text">{cfg.successText}</p>
            <button className="btn-fs" onClick={handleSuccessAction}>{cfg.successButton}</button>
          </div>
        ) : (
          <>
            <div className="mt">{cfg.title}</div>
            <div className="ms">{cfg.subtitle}</div>

            <div className="fg-row">
              <div className="fg">
                <label>Имя</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Александр" disabled={status === 'loading'} />
              </div>
              <div className="fg">
                <label>Фамилия</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  placeholder="Иванов" disabled={status === 'loading'} />
              </div>
            </div>

            <div className="fg">
              <label>Компания-застройщик</label>
              <input type="text" name="company" value={form.company} onChange={handleChange}
                placeholder={'\u00ABООО СтройГрупп\u00BB'}
                disabled={status === 'loading'} />
            </div>

            <div className="fg">
              <label>Телефон</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="+7 (___) ___-__-__" disabled={status === 'loading'} />
            </div>

            <div className="fg">
              <label>E-mail</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="info@company.ru" disabled={status === 'loading'} />
            </div>

            {status === 'error' && (
              <p style={{ color: '#c0392b', fontSize: 13, textAlign: 'center', margin: '8px 0' }}>{errorMsg}</p>
            )}

            <button className="btn-fs" onClick={handleSubmit} disabled={status === 'loading'}>
              {status === 'loading' ? 'Отправка...' : cfg.button}
            </button>

            <div className="fn">Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных</div>
          </>
        )}
      </div>
    </div>
  )
}

export default FormModal
