import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllDiagrams, getDiagramsByGroup, getAllGroups, deleteDiagram } from '../db'
import useAppStore from '../store/useAppStore'
import DiagramCard from '../components/diagram/DiagramCard'
import DiagramFormDialog from '../components/diagram/DiagramFormDialog'
import GroupManageDialog from '../components/diagram/GroupManageDialog'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function DiagramsPage() {
  const navigate = useNavigate()
  const refreshKey = useAppStore((s) => s.refreshKey)
  const [diagrams, setDiagrams] = useState([])
  const [groups, setGroups] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'group'
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editDiagram, setEditDiagram] = useState(null)
  const [showGroupManage, setShowGroupManage] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([getAllDiagrams(), getAllGroups()]).then(([d, g]) => {
      if (!cancelled) {
        setDiagrams(d)
        setGroups(g)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  const displayedDiagrams = selectedGroup
    ? diagrams.filter((d) => d.groupId === selectedGroup.id)
    : viewMode === 'grid'
    ? diagrams
    : []

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteDiagram(deleteTarget.id)
      useAppStore.getState().triggerRefresh()
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-full flex flex-col relative">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">图解</h1>
        <button
          onClick={() => setShowGroupManage(true)}
          className="text-sm text-primary-600 active:text-primary-700"
        >
          管理分组
        </button>
      </div>

      {/* View toggle */}
      <div className="px-4 mb-3 flex gap-2">
        <button
          onClick={() => { setViewMode('grid'); setSelectedGroup(null) }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            viewMode === 'grid' && !selectedGroup
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          封面浏览
        </button>
        <button
          onClick={() => setViewMode('group')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            viewMode === 'group'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          分组浏览
        </button>
      </div>

      {/* Group folders */}
      {viewMode === 'group' && !selectedGroup && (
        <div className="px-4 pb-3">
          {groups.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">暂无分组，点击右上角"管理分组"创建</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* All diagrams */}
              <div
                onClick={() => setSelectedGroup(null)}
                className="aspect-square rounded-xl bg-gray-100 flex flex-col items-center justify-center active:bg-gray-200 cursor-pointer"
              >
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="mt-2 text-sm text-gray-600">全部</span>
                <span className="text-xs text-gray-400">{diagrams.length} 个</span>
              </div>
              {groups.map((g) => {
                const count = diagrams.filter((d) => d.groupId === g.id).length
                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGroup(g)}
                    className="aspect-square rounded-xl bg-gray-100 flex flex-col items-center justify-center active:bg-gray-200 cursor-pointer"
                  >
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-600">{g.name}</span>
                    <span className="text-xs text-gray-400">{count} 个</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Group header with back */}
      {selectedGroup && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <button onClick={() => setSelectedGroup(null)} className="text-primary-600 text-sm">← 返回</button>
          <span className="text-sm text-gray-600">{selectedGroup.name}</span>
        </div>
      )}

      {/* Diagram grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayedDiagrams.length === 0 ? (
        <div className="flex-1">
          <EmptyState
            title="暂无图解"
            description={viewMode === 'grid' ? '点击右下角 + 添加图解' : '该分组暂无图解'}
          />
        </div>
      ) : (
        <div className="px-4 pb-24 grid grid-cols-2 gap-3">
          {displayedDiagrams.map((d) => (
            <DiagramCard
              key={d.id}
              diagram={d}
              onClick={() => navigate(`/diagram/${d.id}`)}
              onEdit={() => { setEditDiagram(d); setShowForm(true) }}
              onDelete={() => setDeleteTarget(d)}
            />
          ))}
        </div>
      )}

      {/* FAB — sticky so it stays inside phone mockup */}
      <div className="sticky bottom-20 flex justify-end px-4 z-40 pointer-events-none">
        <button
          onClick={() => { setEditDiagram(null); setShowForm(true) }}
          className="pointer-events-auto w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center active:bg-primary-600 active:scale-95 transition-transform"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Dialogs */}
      {showForm && (
        <DiagramFormDialog
          open={showForm}
          diagram={editDiagram}
          onClose={() => { setShowForm(false); setEditDiagram(null) }}
        />
      )}

      {showGroupManage && (
        <GroupManageDialog
          open={showGroupManage}
          onClose={() => setShowGroupManage(false)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除图解"
        message={`确定要删除「${deleteTarget?.name}」吗？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  )
}
