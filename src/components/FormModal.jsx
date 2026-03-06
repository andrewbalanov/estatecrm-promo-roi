import React, { useState } from 'react'
import './FormModal.css'

function FormModal({ isOpen, onClose, onSuccess }) {
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

      const response = await fetch('/roi/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          company: form.company,
          email: form.email,
          phone: form.phone,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('idle')
        handleClose()
        if (onSuccess) onSuccess(form.company)
      } else {
        setErrorMsg('Не удалось отправить заявку. Попробуйте ещё раз.')
        setStatus('error')
      }
    } catch (err) {
      console.error('Submit error:', err)
      // Even if server fails, show results (non-blocking UX)
      setStatus('idle')
      handleClose()
      if (onSuccess) onSuccess(form.company)
    }
  }

  const handleClose = () => {
    setStatus('idle')
    setErrorMsg('')
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  return (
    <div className={`mo on`} onClick={handleOverlayClick}>
      <div className="mb">
        <button className="mc" onClick={handleClose} type="button">&times;</button>
        <div className="mt">Ваш персональный расчёт готов</div>
        <div className="ms">Оставьте контакты — мы пришлём PDF и свяжемся для обсуждения проекта</div>

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
            placeholder={'ООО \u00AB\u0421\u0442\u0440\u043E\u0439\u0413\u0440\u0443\u043F\u043F\u00BB'}
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
          {status === 'loading' ? 'Отправка...' : 'Показать расчёт'}
        </button>

        <div className="fn">Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных</div>
      </div>
    </div>
  )
}

export default FormModal
