import { Link } from 'react-router-dom'
import projects from '../data/projects.js'
import ProjectCard from '../components/ProjectCard.jsx'
import styles from './HomePage.module.css'

const featured = projects.filter(p => p.featured && p.status !== 'draft')
const recent   = projects.filter(p => !p.featured && p.status !== 'draft').slice(0, 6)

export default function HomePage() {
  return (
    <main className={styles.page}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className="container">

          {/* Aperture graphic placeholder — top corner, to be designed */}
          <div className={styles.apertureCorner} aria-hidden="true">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.apertureSvg}>
              <circle cx="60" cy="60" r="56" stroke="#c9a84c" strokeWidth="1" opacity="0.2"/>
              <circle cx="60" cy="60" r="38" stroke="#c9a84c" strokeWidth="1" opacity="0.15"/>
              <circle cx="60" cy="60" r="18" fill="none" stroke="#c9a84c" strokeWidth="1.5" opacity="0.35"/>
              <circle cx="60" cy="60" r="6" fill="#c9a84c" opacity="0.4"/>
              <g fill="#c9a84c" opacity="0.2">
                <path d="M60,4 L64,22 L56,22 Z" transform="rotate(0,60,60)"/>
                <path d="M60,4 L64,22 L56,22 Z" transform="rotate(60,60,60)"/>
                <path d="M60,4 L64,22 L56,22 Z" transform="rotate(120,60,60)"/>
                <path d="M60,4 L64,22 L56,22 Z" transform="rotate(180,60,60)"/>
                <path d="M60,4 L64,22 L56,22 Z" transform="rotate(240,60,60)"/>
                <path d="M60,4 L64,22 L56,22 Z" transform="rotate(300,60,60)"/>
              </g>
            </svg>
          </div>

          <p className={`${styles.eyebrow} fade-up`}>
            <span className={styles.dot} /> Latest
          </p>
          <h1 className={`${styles.headline} fade-up delay-1`}>
            Letting the<br />
            <em>light in.</em>
          </h1>
          <p className={`${styles.sub} fade-up delay-2`}>
            A notebook of curiosity — data, sport, health, writing
            and whatever else opens up when you start looking.
          </p>
          <div className={`${styles.heroCta} fade-up delay-3`}>
            <Link to="/projects" className={styles.btnPrimary}>Browse projects</Link>
            <Link to="/about"    className={styles.btnGhost}>About this site</Link>
          </div>
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Featured</h2>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((p, i) => (
                <div key={p.id} className={`fade-up delay-${i + 1}`}>
                  <ProjectCard project={p} featured />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recent ───────────────────────────────────────────────────────── */}
      {recent.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Recent</h2>
              <Link to="/projects" className={styles.seeAll}>All projects →</Link>
            </div>
            <div className={styles.grid}>
              {recent.map((p, i) => (
                <div key={p.id} className={`fade-up delay-${Math.min(i + 1, 4)}`}>
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── About strip ──────────────────────────────────────────────────── */}
      <section className={styles.strip}>
        <div className="container">
          <div className={styles.stripInner}>
            <div className={styles.stripText}>
              <h2>What is The Aperture?</h2>
              <p>
                An aperture is an opening that lets light through. This site is that —
                a personal notebook made public, covering whatever is worth looking at
                closely: data, systems, sport, health, photography, and the gaps
                between things.
              </p>
              <Link to="/about" className={styles.btnGhost}>More about this →</Link>
            </div>
            <div className={styles.stripTopics}>
              {['Sport & Data','NHS & Primary Care','Writing','Photography','Politics','Curiosity'].map(t => (
                <span key={t} className={styles.topic}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
