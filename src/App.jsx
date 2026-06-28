import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProjectsPage from './pages/ProjectsPage'
import DiagramsPage from './pages/DiagramsPage'
import DiagramDetailPage from './pages/DiagramDetailPage'
import GrowthPage from './pages/GrowthPage'
import WorkspacePage from './pages/WorkspacePage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/diagrams" element={<DiagramsPage />} />
        <Route path="/growth" element={<GrowthPage />} />
      </Route>
      <Route path="/diagram/:id" element={<DiagramDetailPage />} />
      <Route path="/project/:id" element={<WorkspacePage />} />
    </Routes>
  )
}
