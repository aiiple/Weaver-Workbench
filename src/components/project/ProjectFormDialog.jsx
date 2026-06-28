import { useState, useEffect, useRef } from 'react'
import { nanoid } from 'nanoid'
import { addProject, updateProject, getAllDiagrams } from '../../db'
import { compressImage } from '../../utils/image'
import useAppStore from '../../store/useAppStore'
import { formatShortDate } from '../../utils/date'
import FreeCropEditor from '../diagram/FreeCropEditor'

export default function ProjectFormDialog({ open, project, diagramId, mode, onClose }) {
  const isQuickCreate = mode === 'quick'
  const [name, setName] = useState('')
  const [selectedDiagramId, setSelectedDiagramId] = useState(diagramId || '')
  const [diagrams, setDiagrams] = useState([])
  const [projectImages, setProjectImages] = useState([]) // quick create images
  const [originalProjectImages, setOriginalProjectImages] = useState([])
  const [cropping, setCropping] = useState(null) // { image, index }
  const fileInputRef = useRef(null)
  const triggerRefresh = useAppStore((s) => s.triggerRefresh)

  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.name)
        setSelectedDiagramId(project.diagramId || '')
        setProjectImages(project.images || [])
        setOriginalProjectImages(project.originalImages || project.images || [])
      } else if (isQuickCreate) {
        setName(`新项目 ${formatShortDate(Date.now())}`)
        setSelectedDiagramId('')
        setProjectImages([])
        setOriginalProjectImages([])
      } else if (diagramId) {
        setName('')
        setSelectedDiagramId(diagramId)
        setProjectImages([])
        setOriginalProjectImages([])
      } else {
        setName('')
        setSelectedDiagramId('')
        setProjectImages([])
        setOriginalProjectImages([])
      }
      if (!isQuickCreate) {
        getAllDiagrams().then(setDiagrams)
      }
    }
  }, [open, project, diagramId, isQuickCreate])

  if (!open) return null

  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      const base64 = await compressImage(file)
      setProjectImages((prev) => [...prev, base64])
      setOriginalProjectImages((prev) => [...prev, base64])
    }
    e.target.value = ''
  }

  const handleRemoveProjectImage = (index) => {
    setProjectImages((prev) => prev.filter((_, i) => i !== index))
    setOriginalProjectImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCropProjectImage = (index) => {
    const source = originalProjectImages[index] || projectImages[index]
    setCropping({ image: source, index })
  }

  const handleCropComplete = (croppedBase64) => {
    if (cropping && cropping.index !== undefined) {
      setProjectImages((prev) => prev.map((img, i) => (i === cropping.index ? croppedBase64 : img)))
    }
    setCropping(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    if (project) {
      await updateProject(project.id, {
        name: name.trim(),
        diagramId: selectedDiagramId || null,
        images: projectImages,
        originalImages: originalProjectImages,
      })
    } else {
      await addProject({
        id: nanoid(),
        name: name.trim(),
        diagramId: isQuickCreate ? null : (selectedDiagramId || null),
        coverImage: projectImages.length > 0 ? projectImages[0] : null,
        images: projectImages,
        originalImages: originalProjectImages,
        currentRow: 0,
        currentStitch: 0,
        customIncrement: 5,
        status: 'active',
        completionCount: 0,
      })
    }
    triggerRefresh()
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 pb-safe max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {project ? '编辑项目' : (isQuickCreate ? '快速创建项目' : '从图解创建项目')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">项目名称</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="输入项目名称"
              />
            </div>

            {/* Diagram selector — only for "from diagram" mode */}
            {!isQuickCreate && !project && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">关联图解（可选）</label>
                <select
                  value={selectedDiagramId}
                  onChange={(e) => setSelectedDiagramId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <option value="">不关联</option>
                  {diagrams.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Edit mode diagram selector */}
            {!isQuickCreate && project && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">关联图解（可选）</label>
                <select
                  value={selectedDiagramId}
                  onChange={(e) => setSelectedDiagramId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <option value="">不关联</option>
                  {diagrams.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Image upload — quick create mode or editing a quick-created project */}
            {(isQuickCreate || project) && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {isQuickCreate ? '图解图片（可选，本地独立上传）' : '项目图片'}（{projectImages.length} 张）
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {projectImages.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img src={img} alt={`图片 ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 flex">
                        <button
                          type="button"
                          onClick={() => handleCropProjectImage(i)}
                          className="flex-1 bg-black/50 text-white text-[10px] py-0.5"
                        >
                          裁剪
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProjectImage(i)}
                        className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-bl-lg flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-2xl active:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">图片属于项目本身，不会同步到图解库</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddImages}
                  className="hidden"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm rounded-lg bg-gray-100 text-gray-700 active:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-sm rounded-lg bg-primary-500 text-white active:bg-primary-600 font-medium"
              >
                {project ? '保存' : '创建'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {cropping && (
        <FreeCropEditor
          image={cropping.image}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropping(null)}
        />
      )}
    </>
  )
}
