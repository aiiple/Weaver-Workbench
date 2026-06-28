import { useState, useEffect } from 'react'
import { getAllProjects, getDiagramById, deleteProject } from '../db'
import useAppStore from '../store/useAppStore'
import ProjectCard from '../components/project/ProjectCard'
import ProjectFormDialog from '../components/project/ProjectFormDialog'
import CreateProjectFAB from '../components/project/CreateProjectFAB'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function ProjectsPage() {
  const refreshKey = useAppStore((s) => s.refreshKey)
  const [projects, setProjects] = useState([])
  const [diagrams, setDiagrams] = useState({})
  const [tab, setTab] = useState('active')
  const [editProject, setEditProject] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getAllProjects().then(async (list) => {
      if (cancelled) return
      setProjects(list)
      // Load associated diagrams for covers
      const diagramMap = {}
      const ids = [...new Set(list.map((p) => p.diagramId).filter(Boolean))]
      for (const id of ids) {
        const d = await getDiagramById(id)
        if (d) diagramMap[id] = d
      }
      if (!cancelled) {
        setDiagrams(diagramMap)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  const filtered = projects.filter((p) => p.status === tab)
  const completedCount = projects.filter((p) => p.status === 'completed').length
  const activeCount = projects.filter((p) => p.status === 'active').length

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteProject(deleteTarget.id)
      useAppStore.getState().triggerRefresh()
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-full flex flex-col relative">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">在织</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-2 mb-3">
        <button
          onClick={() => setTab('active')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'active'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          进行中 {activeCount > 0 && `(${activeCount})`}
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          已完成 {completedCount > 0 && `(${completedCount})`}
        </button>
      </div>

      {/* Project grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1">
          <EmptyState
            title={tab === 'active' ? '暂无进行中的项目' : '暂无已完成的项目'}
            description={tab === 'active' ? '点击右下角 + 创建第一个项目' : ''}
          />
        </div>
      ) : (
        <div className="px-4 pb-24 flex flex-col gap-2">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              diagram={diagrams[p.diagramId]}
              onEdit={() => setEditProject(p)}
              onDelete={() => setDeleteTarget(p)}
            />
          ))}
        </div>
      )}

      <CreateProjectFAB />

      {editProject && (
        <ProjectFormDialog
          open={!!editProject}
          project={editProject}
          onClose={() => setEditProject(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除项目"
        message={`确定要删除「${deleteTarget?.name}」吗？仅删除项目数据，不会删除关联图解。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
