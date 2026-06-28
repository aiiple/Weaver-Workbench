import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllDiagrams } from '../../db'
import ProjectFormDialog from './ProjectFormDialog'

export default function CreateProjectFAB() {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState(null) // 'quick' | 'link-diagram'
  const [diagramId, setDiagramId] = useState(null)

  const handleQuickCreate = () => {
    setShowMenu(false)
    setFormMode('quick')
    setDiagramId(null)
    setShowForm(true)
  }

  const handleFromDiagram = async () => {
    const diagrams = await getAllDiagrams()
    if (diagrams.length === 0) {
      alert('请先添加图解')
      setShowMenu(false)
      return
    }
    if (diagrams.length === 1) {
      setDiagramId(diagrams[0].id)
    }
    setShowMenu(false)
    setFormMode('link-diagram')
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setDiagramId(null)
    setFormMode(null)
  }

  return (
    <>
      {/* FAB button */}
      <div className="sticky bottom-20 flex justify-end px-4 z-40 pointer-events-none">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="pointer-events-auto w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center active:bg-primary-600 active:scale-95 transition-transform"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Menu overlay */}
      {showMenu && (
        <div className="absolute inset-0 z-50 bg-black/20" onClick={() => setShowMenu(false)}>
          <div className="absolute bottom-36 right-4 flex flex-col gap-2">
            <button
              onClick={handleQuickCreate}
              className="bg-white rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-gray-800 active:bg-gray-50 whitespace-nowrap"
            >
              ⚡ 快速创建
            </button>
            <button
              onClick={handleFromDiagram}
              className="bg-white rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-gray-800 active:bg-gray-50 whitespace-nowrap"
            >
              📖 从图解创建
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <ProjectFormDialog
          open={showForm}
          diagramId={diagramId}
          mode={formMode}
          onClose={handleFormClose}
        />
      )}
    </>
  )
}
