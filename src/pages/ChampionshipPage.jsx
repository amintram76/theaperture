import { Link } from 'react-router-dom'
import ChampionshipChart from '../tools/ChampionshipChart.jsx'
import styles from './ProjectPage.module.css'

export default function ChampionshipPage() {
  return (
    <main className={styles.page}>

      {/* Header */}
      <div className={`container ${styles.header}`}>
        <Link to="/projects" className={styles.back}>← Projects</Link>
        <div className={`${styles.meta} fade-up`}>
          <div className={styles.tags}>
            <span className={styles.tag}>Sport</span>
            <span className={styles.tag}>Data</span>
          </div>
          <span className={styles.date}>April 2026</span>
        </div>
        <h1 className={`${styles.title} fade-up delay-1`}>
          EFL Championship 2025/26<br /><em>Table Position Race</em>
        </h1>
        <p className={`${styles.summary} fade-up delay-2`}>
          Every team's league position after every matchday, animated.
          Data fetched live from football-data.org and computed from
          real match results — not scraped snapshots.
        </p>
      </div>

      {/* Full-width chart */}
      <div className={`${styles.chartWrap} fade-up delay-3`}>
        <ChampionshipChart />
      </div>

      {/* Notes */}
      <div className={`container ${styles.notes}`}>
        <h2>Notes on the data</h2>
        <ul>
          <li>Table positions are computed by applying the EFL's tiebreaker rules (points → goal difference → goals scored → head-to-head) to every result up to each matchday.</li>
          <li>Sheffield Wednesday received an 18-point deduction in total: 12 points for entering administration (October 2025), then a further 6 for failing to meet payment obligations (December 2025).</li>
          <li>Leicester City received a 6-point deduction for breaching Profit and Sustainability Rules (February 2026).</li>
          <li>Data sourced from <a href="https://www.football-data.org" target="_blank" rel="noreferrer">football-data.org</a> free tier API.</li>
        </ul>
      </div>

    </main>
  )
}
