import { useState, useEffect, useRef } from 'react'
import { nanoid } from 'nanoid'
import { addDiagram, updateDiagram, getAllGroups } from '../../db'
import { compressImage } from '../../utils/image'
import useAppStore from '../../store/useAppStore'
import ImageCropper from './ImageCropper'
import FreeCropEditor from './FreeCropEditor'

export default function DiagramFormDialog({ open, diagram, onClose }) {
  const [name, setName] = useState('')
  const [groupId, setGroupId] = useState('')
  const [groups, setGroups] = useState([])
  const [images, setImages] = useState([]) // base64 strings (may be cropped)
  const [originalImages, setOriginalImages] = useState([]) // always full originals, never overwritten by crop
  const [coverImage, setCoverImage] = useState('')
  // { image: base64, type: 'cover' | 'diagram', index?: number }
  const [cropping, setCropping] = useState(null)
  const fileInputRef = useRef(null)
  const triggerRefresh = useAppStore((s) => s.triggerRefresh)

  useEffect(() => {
    if (open) {
      getAllGroups().then(setGroups)
      if (diagram) {
        setName(diagram.name)
        setGroupId(diagram.groupId || '')
        setImages(diagram.images || [])
        setOriginalImages(diagram.originalImages || diagram.images || [])
        setCoverImage(diagram.coverImage || '')
      } else {
        setName('')
        setGroupId('')
        setImages([])
        setOriginalImages([])
        setCoverImage('')
      }
    }
  }, [open, diagram])

  if (!open) return null

  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      const base64 = await compressImage(file)
      setImages((prev) => [...prev, base64])
      setOriginalImages((prev) => [...prev, base64])
      // Use first image as cover if no cover set yet
      if (!coverImage && images.length === 0) {
        setCropping({ image: base64, type: 'cover' })
      }
    }
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setOriginalImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCropComplete = (croppedBase64) => {
    if (!cropping) return
    if (cropping.type === 'cover') {
      setCoverImage(croppedBase64)
    } else if (cropping.type === 'diagram' && cropping.index !== undefined) {
      setImages((prev) => prev.map((img, i) => (i === cropping.index ? croppedBase64 : img)))
      // If the cropped image was being used as cover, update cover too
      if (cropping.image === coverImage) {
        setCoverImage(croppedBase64)
      }
    }
    setCropping(null)
  }

  const handleCropImage = (img, index) => {
    // Always pass the original full image to the cropper, never an already-cropped version
    const source = (originalImages[index] || img)
    setCropping({ image: source, type: 'diagram', index })
  }

  const handleChooseCover = (img) => {
    setCropping({ image: img, type: 'cover' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    if (images.length === 0) {
      alert('请至少添加一张图解图片')
      return
    }

    const data = {
      name: name.trim(),
      groupId: groupId || null,
      images,
      originalImages,
      coverImage: coverImage || images[0],
    }

    if (diagram) {
      await updateDiagram(diagram.id, data)
    } else {
      await addDiagram({ id: nanoid(), ...data })
    }
    triggerRefresh()
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 pb-safe max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {diagram ? '编辑图解' : '新增图解'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">图解名称</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="输入图解名称"
              />
            </div>

            {/* Group */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">所属分组（可选）</label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">无分组</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Cover preview */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">封面预览</label>
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                {coverImage ? (
                  <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">未设置</div>
                )}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                图解图片（{images.length} 张）
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    <img src={img} alt={`图解 ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 flex">
                      <button
                        type="button"
                        onClick={() => handleCropImage(img, i)}
                        className="flex-1 bg-black/50 text-white text-[10px] py-0.5"
                      >
                        裁剪
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChooseCover(img)}
                        className="flex-1 bg-black/70 text-white text-[10px] py-0.5"
                      >
                        封面
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddImages}
                className="hidden"
              />
            </div>

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
                {diagram ? '保存' : '添加'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {cropping && cropping.type === 'cover' && (
        <ImageCropper
          image={cropping.image}
          aspect={1}
          title="裁剪封面 (1:1)"
          onCropComplete={handleCropComplete}
          onCancel={() => setCropping(null)}
        />
      )}
      {cropping && cropping.type === 'diagram' && (
        <FreeCropEditor
          image={cropping.image}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropping(null)}
        />
      )}
    </>
  )
}
