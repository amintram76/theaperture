import { Link } from 'react-router-dom'
import styles from './ProjectCard.module.css'

const TAG_LABELS = {
  sport: 'Sport',
  nhs: 'NHS',
  data: 'Data',
  writing: 'Writing',
  photography: 'Photography',
  productivity: 'Productivity',
  politics: 'Politics',
}

export default function ProjectCard({ project, featured = false }) {
  const href = project.external ? project.href : `/projects/${project.id}`
  const Wrapper = project.external ? 'a' : Link
  const wrapperProps = project.external
    ? { href, target: '_blank', rel: 'noreferrer' }
    : { to: href }

  const dateStr = new Date(project.date).toLocaleDateString('en-GB', {
    month: 'short', year: 'numeric',
  })

  return (
    <Wrapper {...wrapperProps} className={`${styles.card} ${featured ? styles.featured : ''}`}>
      <div className={styles.tags}>
        {project.tags.map(tag => (
          <span key={tag} className={`${styles.tag} ${styles[tag]}`}>
            {TAG_LABELS[tag] || tag}
          </span>
        ))}
        {project.status === 'wip' && <span className={styles.wip}>In progress</span>}
      </div>

      <h2 className={styles.title}>{project.title}</h2>
      <p className={styles.summary}>{project.summary}</p>

      <div className={styles.footer}>
        <span className={styles.date}>{dateStr}</span>
        <span className={styles.arrow}>→</span>
      </div>
    </Wrapper>
  )
}
