import { Link } from 'react-router-dom'
import styles from './AboutPage.module.css'

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.layout}>

          <article className={styles.content}>
            <header className={`${styles.header} fade-up`}>
              <p className={styles.eyebrow}>About</p>
              <h1 className={styles.title}>Letting the<br /><em>light in.</em></h1>
            </header>

            <div className={`${styles.body} fade-up delay-1`}>
              <p>
                An aperture is an opening — the gap through which light passes
                to form an image. This site is that. An opening onto things worth
                looking at closely.
              </p>

              <p>
                It's a personal notebook made public. The subjects vary. The
                intent doesn't: curiosity, rigour, and the honest acknowledgement
                that the more you look, the more there is to see.
              </p>

              <p>
                More about the author and the thinking behind this site coming soon.
              </p>

              <div className={styles.cta}>
                <Link to="/projects" className={styles.link}>Browse the projects →</Link>
              </div>
            </div>
          </article>

          <aside className={`${styles.sidebar} fade-up delay-2`}>
            <div className={styles.card}>
              <p className={styles.cardLabel}>The name</p>
              <p className={styles.cardText}>
                An aperture lets light through. The wider it opens,
                the more you see — and the less is in sharp focus.
                That tension is the point.
              </p>
            </div>

            <div className={styles.card}>
              <p className={styles.cardLabel}>Covers</p>
              <div className={styles.tags}>
                {['Data & Visualisation','Sport','NHS & Primary Care','Writing','Photography','Curiosity'].map(t => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <p className={styles.cardLabel}>Writing elsewhere</p>
              <a
                href="https://practiceindex.co.uk"
                target="_blank"
                rel="noreferrer"
                className={styles.externalLink}
              >
                Practice Index →
              </a>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
