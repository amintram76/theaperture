import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Nav.module.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [loc])

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          {/* Aperture graphic placeholder — to be designed */}
          <span className={styles.logoMark} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="10" stroke="#c9a84c" strokeWidth="1.2" opacity="0.6"/>
              <circle cx="11" cy="11" r="3.5" fill="#c9a84c" opacity="0.9"/>
              <g fill="#c9a84c" opacity="0.75">
                <path d="M11,1 L12.5,7 L9.5,7 Z" transform="rotate(0,11,11)"/>
                <path d="M11,1 L12.5,7 L9.5,7 Z" transform="rotate(60,11,11)"/>
                <path d="M11,1 L12.5,7 L9.5,7 Z" transform="rotate(120,11,11)"/>
                <path d="M11,1 L12.5,7 L9.5,7 Z" transform="rotate(180,11,11)"/>
                <path d="M11,1 L12.5,7 L9.5,7 Z" transform="rotate(240,11,11)"/>
                <path d="M11,1 L12.5,7 L9.5,7 Z" transform="rotate(300,11,11)"/>
              </g>
            </svg>
          </span>
          <span className={styles.logoText}>The Aperture</span>
        </Link>

        <nav className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <Link to="/"         className={loc.pathname === '/'         ? styles.active : ''}>Home</Link>
          <Link to="/projects" className={loc.pathname === '/projects' ? styles.active : ''}>Projects</Link>
          <Link to="/about"    className={loc.pathname === '/about'    ? styles.active : ''}>About</Link>
        </nav>

        <button
          className={styles.burger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
