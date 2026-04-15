import { useState } from 'react'
import projects from '../data/projects.js'
import ProjectCard from '../components/ProjectCard.jsx'
import styles from './ProjectsPage.module.css'

const ALL_TAGS = ['sport', 'nhs', 'data', 'writing', 'photography', 'productivity', 'politics']
const TAG_LABELS = {
  sport:'Sport', nhs:'NHS', data:'Data', writing:'Writing',
  photography:'Photography', productivity:'Productivity', politics:'Politics',
}

export default function ProjectsPage() {
  const [activeTag, setActiveTag] = useState(null)

  const visible = projects
    .filter(p => p.status !== 'draft')
    .filter(p => !activeTag || p.tags.includes(activeTag))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const usedTags = [...new Set(projects.flatMap(p => p.tags))]

  return (
    <main className={styles.page}>
      <div className="container">

        <header className={`${styles.header} fade-up`}>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.sub}>
            Tools, visualisations, writing and experiments — everything published here.
          </p>
        </header>

        {/* Tag filter */}
        <div className={`${styles.filters} fade-up delay-1`}>
          <button
            className={`${styles.filter} ${!activeTag ? styles.active : ''}`}
            onClick={() => setActiveTag(null)}
          >All</button>
          {usedTags.map(tag => (
            <button
              key={tag}
              className={`${styles.filter} ${activeTag === tag ? styles.active : ''}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {TAG_LABELS[tag] || tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        {visible.length > 0 ? (
          <div className={`${styles.grid} fade-up delay-2`}>
            {visible.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>Nothing here yet under that filter.</p>
          </div>
        )}

      </div>
    </main>
  )
}
