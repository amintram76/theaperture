import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <div className="container">
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Nothing here.</h1>
        <p className={styles.sub}>This page doesn't exist, or the aperture is pointed elsewhere.</p>
        <Link to="/" className={styles.home}>← Back to home</Link>
      </div>
    </main>
  )
}
