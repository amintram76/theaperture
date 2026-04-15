import { Routes, Route } from 'react-router-dom'
import Nav          from './components/Nav.jsx'
import Footer       from './components/Footer.jsx'
import HomePage         from './pages/HomePage.jsx'
import ProjectsPage     from './pages/ProjectsPage.jsx'
import AboutPage        from './pages/AboutPage.jsx'
import ChampionshipPage from './pages/ChampionshipPage.jsx'
import NotFoundPage     from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/"                               element={<HomePage />} />
        <Route path="/projects"                       element={<ProjectsPage />} />
        <Route path="/projects/championship-table"    element={<ChampionshipPage />} />
        <Route path="/about"                          element={<AboutPage />} />
        <Route path="*"                               element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  )
}
