import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { getAllGroups, addGroup, updateGroup, deleteGroup } from '../../db'
import useAppStore from '../../store/useAppStore'

export default function GroupManageDialog({ open, onClose }) {
  const [groups, setGroups] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')
  const triggerRefresh = useAppStore((s) => s.triggerRefresh)

  useEffect(() => {
    if (open) getAllGroups().then(setGroups)
  }, [open])

  if (!open) return null

  const handleAdd = async () => {
    if (!newName.trim()) return
    await addGroup({ id: nanoid(), name: newName.trim() })
    setNewName('')
    setGroups(await getAllGroups())
  }

  const handleUpdate = async (id) => {
    if (!editName.trim()) return
    await updateGroup(id, { name: editName.trim() })
    setEditingId(null)
    setGroups(await getAllGroups())
  }

  const handleDelete = async (id) => {
    await deleteGroup(id)
    setGroups(await getAllGroups())
    triggerRefresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 pb-safe max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">管理分组</h3>

        {/* Add new */}
        <div className="flex gap-2 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder="新建分组名称"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg active:bg-primary-600"
          >
            添加
          </button>
        </div>

        {/* Group list */}
        {groups.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">暂无分组</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((g) => (
              <li key={g.id} className="flex items-center gap-2">
                {editingId === g.id ? (
                  <>
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(g.id)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <button onClick={() => handleUpdate(g.id)} className="text-xs text-primary-600 px-2">保存</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 px-2">取消</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-800">{g.name}</span>
                    <button onClick={() => { setEditingId(g.id); setEditName(g.name) }} className="text-xs text-gray-400 px-1">重命名</button>
                    <button onClick={() => handleDelete(g.id)} className="text-xs text-red-400 px-1">删除</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 text-sm rounded-lg bg-gray-100 text-gray-700 active:bg-gray-200"
        >
          完成
        </button>
      </div>
    </div>
  )
}
