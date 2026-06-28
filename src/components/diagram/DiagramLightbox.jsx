import { useState } from 'react'

export default function DiagramLightbox({ images, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex)

  const prev = () => setIndex((i) => (i > 0 ? i - 1 : images.length - 1))
  const next = () => setIndex((i) => (i < images.length - 1 ? i + 1 : 0))

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 text-white">
        <span className="text-sm">{index + 1} / {images.length}</span>
        <button onClick={onClose} className="text-sm px-2 py-1">关闭</button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <img
          src={images[index]}
          alt={`图解 ${index + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Nav */}
      {images.length > 1 && (
        <div className="flex justify-between px-4 py-3">
          <button
            onClick={prev}
            className="text-white text-sm px-4 py-2 active:text-primary-300"
          >
            ← 上一张
          </button>
          <button
            onClick={next}
            className="text-white text-sm px-4 py-2 active:text-primary-300"
          >
            下一张 →
          </button>
        </div>
      )}
    </div>
  )
}
