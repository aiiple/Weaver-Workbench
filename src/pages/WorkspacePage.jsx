import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjectById, updateProject, getDiagramById, addRecordIfNotExists } from '../db'
import { todayStr } from '../utils/date'
import useAppStore from '../store/useAppStore'
import DiagramViewer from '../components/diagram/DiagramViewer'
import RowCounter from '../components/workspace/RowCounter'
import StitchCounter from '../components/workspace/StitchCounter'
import ProjectActions from '../components/workspace/ProjectActions'
import ProjectFormDialog from '../components/project/ProjectFormDialog'

export default function WorkspacePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const triggerRefresh = useAppStore((s) => s.triggerRefresh)

  const [project, setProject] = useState(null)
  const [diagram, setDiagram] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProject()
  }, [id])

  const loadProject = async () => {
    const p = await getProjectById(id)
    if (!p) {
      navigate('/projects', { replace: true })
      return
    }
    setProject(p)
    if (p.diagramId) {
      const d = await getDiagramById(p.diagramId)
      setDiagram(d)
    }
    setLoading(false)
  }

  const recordActivity = async (projectId) => {
    await addRecordIfNotExists(projectId, todayStr()).catch(() => {})
  }

  const handleRowIncrement = async () => {
    if (!project) return
    const updated = { ...project, currentRow: project.currentRow + 1, currentStitch: 0 }
    setProject(updated)
    await updateProject(project.id, { currentRow: updated.currentRow, currentStitch: 0 })
    await recordActivity(project.id)
  }

  const handleStitchIncrement = async (n = 1) => {
    if (!project) return
    const updated = { ...project, currentStitch: project.currentStitch + n }
    setProject(updated)
    await updateProject(project.id, { currentStitch: updated.currentStitch })
    await recordActivity(project.id)
  }

  const handleCustomChange = async (n) => {
    if (!project) return
    setProject({ ...project, customIncrement: n })
    await updateProject(project.id, { customIncrement: n })
  }

  const handleComplete = async () => {
    if (!project) return
    const updated = {
      ...project,
      status: 'completed',
      completionCount: project.completionCount + 1,
    }
    setProject(updated)
    await updateProject(project.id, {
      status: 'completed',
      completionCount: updated.completionCount,
    })
    triggerRefresh()
  }

  const handleRestart = async () => {
    if (!project) return
    // 重新开始仅清零进度，作品数不变（完成时已+1）
    const updated = {
      ...project,
      currentRow: 0,
      currentStitch: 0,
      status: 'active',
    }
    setProject(updated)
    await updateProject(project.id, {
      currentRow: 0,
      currentStitch: 0,
      status: 'active',
    })
    triggerRefresh()
  }

  const handleEditClose = () => {
    setShowEdit(false)
    loadProject()
    triggerRefresh()
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto bg-white">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => navigate('/projects')}
          className="p-1 -ml-1 text-gray-500 active:text-gray-800"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-lg font-semibold text-gray-900 truncate">{project.name}</h1>
        <button
          onClick={() => setShowEdit(true)}
          className="text-sm text-gray-400 active:text-primary-600"
        >
          编辑
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Images — project's own images first, then associated diagram */}
        {project.images && project.images.length > 0 ? (
          <DiagramViewer images={project.images} />
        ) : diagram ? (
          <DiagramViewer images={diagram.images} />
        ) : null}

        {/* Counters */}
        <div className="grid grid-cols-2 gap-4">
          <RowCounter value={project.currentRow} onIncrement={handleRowIncrement} />
          <StitchCounter
            value={project.currentStitch}
            customIncrement={project.customIncrement || 5}
            onIncrement={() => handleStitchIncrement(1)}
            onIncrementN={(n) => handleStitchIncrement(n)}
            onCustomChange={handleCustomChange}
          />
        </div>

        {/* Project info */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
          <p>完成次数：{project.completionCount} 次</p>
          {diagram && <p>关联图解：{diagram.name}</p>}
          <p>状态：{project.status === 'completed' ? '已完成' : '进行中'}</p>
        </div>

        {/* Actions */}
        <ProjectActions
          status={project.status}
          onComplete={handleComplete}
          onRestart={handleRestart}
        />
      </div>

      {showEdit && (
        <ProjectFormDialog
          open={showEdit}
          project={project}
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}
