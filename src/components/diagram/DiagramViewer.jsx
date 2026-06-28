import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import DiagramLightbox from './DiagramLightbox'

export default function DiagramViewer({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < images.length - 1) setCurrentIndex((i) => i + 1)
    },
    onSwipedRight: () => {
      if (currentIndex > 0) setCurrentIndex((i) => i - 1)
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  if (!images || images.length === 0) return null

  return (
    <>
      <div {...handlers} className="w-full bg-gray-100 rounded-xl overflow-hidden select-none">
        <img
          src={images[currentIndex]}
          alt={`图解 ${currentIndex + 1}`}
          className="w-full h-64 object-contain bg-gray-100"
          onClick={() => setLightboxOpen(true)}
        />
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 py-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <DiagramLightbox
          images={images}
          initialIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
