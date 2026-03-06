import React, { useState } from 'react'
import './Navbar.css'

function Navbar({ onOpenDemo }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { text: 'Функционал', href: 'https://estatecrm.io/developers/' },
    { text: 'Кейсы', href: 'https://estatecrm.io/cases/' },
    { text: 'Интеграции', href: 'https://estatecrm.io/integrations/' },
    { text: 'Новости', href: 'https://estatecrm.io/blog/' },
  ]

  const handleCta = () => {
    setMenuOpen(false)
    onOpenDemo()
  }

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__logo">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EstateCRM" className="navbar__logo-img" />
        </div>

        <button
          className="navbar__burger"
          onClick={() => setMenuOpen(true)}
          type="button"
          aria-label="Меню"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar__menu ${menuOpen ? 'navbar__menu--open' : ''}`}>
          <div className="navbar__mobile-header">
            <div className="navbar__logo">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EstateCRM" className="navbar__logo-img" />
            </div>
            <button
              className="navbar__close"
              onClick={() => setMenuOpen(false)}
              type="button"
              aria-label="Закрыть"
            >
              <span /><span />
            </button>
          </div>

          <ul className="navbar__links">
            {links.map(link => (
              <li key={link.text}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="navbar__link">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>

          <div className="navbar__right">
            <svg className="navbar__globe" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="9" stroke="#ffffff" strokeWidth="1.3" />
              <ellipse cx="10" cy="10" rx="4.5" ry="9" stroke="#ffffff" strokeWidth="1.3" />
              <line x1="1" y1="10" x2="19" y2="10" stroke="#ffffff" strokeWidth="1.3" />
            </svg>
            <a href="tel:+74950193013" className="navbar__phone">
              +7 (495) 019-30-13
            </a>
            <button className="navbar__cta" onClick={handleCta} type="button">
              Записаться на демо
              <span className="navbar__cta-arrow">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
