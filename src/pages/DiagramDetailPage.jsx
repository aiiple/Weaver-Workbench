import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDiagramById, getAllGroups, getProjectsByDiagramId } from '../db'
import { formatRelativeTime } from '../utils/date'
import DiagramViewer from '../components/diagram/DiagramViewer'
import DiagramFormDialog from '../components/diagram/DiagramFormDialog'
import useAppStore from '../store/useAppStore'

export default function DiagramDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const refreshKey = useAppStore((s) => s.refreshKey)

  const [diagram, setDiagram] = useState(null)
  const [groupName, setGroupName] = useState('')
  const [projects, setProjects] = useState([])
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id, refreshKey])

  const loadData = async () => {
    const d = await getDiagramById(id)
    if (!d) {
      navigate('/diagrams', { replace: true })
      return
    }
    setDiagram(d)

    // Resolve group name
    if (d.groupId) {
      const groups = await getAllGroups()
      const g = groups.find((g) => g.id === d.groupId)
      if (g) setGroupName(g.name)
    } else {
      setGroupName('')
    }

    // Linked projects
    const projs = await getProjectsByDiagramId(id)
    setProjects(projs.reverse()) // newest first

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!diagram) return null

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto bg-white">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => navigate('/diagrams')}
          className="p-1 -ml-1 text-gray-500 active:text-gray-800"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-lg font-semibold text-gray-900 truncate">{diagram.name}</h1>
        <button
          onClick={() => setShowEdit(true)}
          className="text-sm text-gray-400 active:text-primary-600"
        >
          编辑
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Basic info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">名称</span>
            <span className="text-gray-800 font-medium">{diagram.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">分组</span>
            <span className="text-gray-800">{groupName || '无分组'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">图解图片</span>
            <span className="text-gray-800">{diagram.images?.length || 0} 张</span>
          </div>
        </div>

        {/* Image viewer */}
        {diagram.images && diagram.images.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">图解内容</h3>
            <DiagramViewer images={diagram.images} />
          </div>
        )}

        {/* Linked projects */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            关联项目（{projects.length}）
          </h3>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">暂无项目使用此图解</p>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/project/${p.id}`)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl active:bg-gray-100 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      最近制作：{formatRelativeTime(p.updatedAt)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-primary-100 text-primary-600'
                  }`}>
                    {p.status === 'completed' ? '已完成' : '进行中'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <DiagramFormDialog
          open={showEdit}
          diagram={diagram}
          onClose={() => {
            setShowEdit(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}
