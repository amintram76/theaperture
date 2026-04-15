import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.name}><em>The Aperture</em></span>
        <span className={styles.copy}>Letting the light in.</span>
        <span className={styles.year}>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
