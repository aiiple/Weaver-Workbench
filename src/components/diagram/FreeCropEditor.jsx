import { useState, useRef, useCallback } from 'react'

const MIN_SIZE = 40
const HANDLE_SIZE = 24

export default function FreeCropEditor({ image, onCropComplete, onCancel }) {
  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 })
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 })

  // Crop rect in image-pixel coordinates
  const [rect, setRect] = useState(null)
  const dragRef = useRef(null)

  const handleImgLoad = useCallback((e) => {
    const img = e.target
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    setImgNatural({ w: nw, h: nh })

    const container = containerRef.current
    if (container) {
      const maxW = container.clientWidth - 32
      const maxH = container.clientHeight - 32
      const scale = Math.min(maxW / nw, maxH / nh, 1)
      setDisplaySize({ w: Math.round(nw * scale), h: Math.round(nh * scale) })

      // Default crop area: inner 80%
      const marginX = nw * 0.1
      const marginY = nh * 0.1
      setRect({
        x: marginX,
        y: marginY,
        w: nw - marginX * 2,
        h: nh - marginY * 2,
      })
    }
    setImgLoaded(true)
  }, [])

  // Start drag on a handle
  const startDrag = (handle, e) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, startRect: { ...rect } }
    window.addEventListener('pointermove', onDrag)
    window.addEventListener('pointerup', stopDrag)
  }

  const onDrag = useCallback((e) => {
    if (!dragRef.current || !imgRef.current) return
    const { handle, startX, startY, startRect } = dragRef.current
    const imgRect = imgRef.current.getBoundingClientRect()
    const scaleX = imgNatural.w / imgRect.width
    const scaleY = imgNatural.h / imgRect.height
    const dx = (e.clientX - startX) * scaleX
    const dy = (e.clientY - startY) * scaleY

    let r = { ...startRect }

    switch (handle) {
      case 'move':
        r.x = clamp(startRect.x + dx, 0, imgNatural.w - startRect.w)
        r.y = clamp(startRect.y + dy, 0, imgNatural.h - startRect.h)
        break
      case 'nw':
        r.x = clamp(startRect.x + dx, 0, startRect.x + startRect.w - MIN_SIZE)
        r.y = clamp(startRect.y + dy, 0, startRect.y + startRect.h - MIN_SIZE)
        r.w = startRect.x + startRect.w - r.x
        r.h = startRect.y + startRect.h - r.y
        break
      case 'ne':
        r.y = clamp(startRect.y + dy, 0, startRect.y + startRect.h - MIN_SIZE)
        r.w = clamp(startRect.w + dx, MIN_SIZE, imgNatural.w - startRect.x)
        r.h = startRect.y + startRect.h - r.y
        break
      case 'sw':
        r.x = clamp(startRect.x + dx, 0, startRect.x + startRect.w - MIN_SIZE)
        r.w = startRect.x + startRect.w - r.x
        r.h = clamp(startRect.h + dy, MIN_SIZE, imgNatural.h - startRect.y)
        break
      case 'se':
        r.w = clamp(startRect.w + dx, MIN_SIZE, imgNatural.w - startRect.x)
        r.h = clamp(startRect.h + dy, MIN_SIZE, imgNatural.h - startRect.y)
        break
      case 'n':
        r.y = clamp(startRect.y + dy, 0, startRect.y + startRect.h - MIN_SIZE)
        r.h = startRect.y + startRect.h - r.y
        break
      case 's':
        r.h = clamp(startRect.h + dy, MIN_SIZE, imgNatural.h - startRect.y)
        break
      case 'w':
        r.x = clamp(startRect.x + dx, 0, startRect.x + startRect.w - MIN_SIZE)
        r.w = startRect.x + startRect.w - r.x
        break
      case 'e':
        r.w = clamp(startRect.w + dx, MIN_SIZE, imgNatural.w - startRect.x)
        break
    }
    setRect(r)
  }, [imgNatural, startDrag])

  const stopDrag = useCallback(() => {
    dragRef.current = null
    window.removeEventListener('pointermove', onDrag)
    window.removeEventListener('pointerup', stopDrag)
  }, [onDrag])

  // Start move drag from the crop area itself
  const startMove = (e) => {
    const imgRect = imgRef.current.getBoundingClientRect()
    const scaleX = imgNatural.w / imgRect.width
    const scaleY = imgNatural.h / imgRect.height
    const ix = (e.clientX - imgRect.left) * scaleX
    const iy = (e.clientY - imgRect.top) * scaleY
    if (ix >= rect.x && ix <= rect.x + rect.w && iy >= rect.y && iy <= rect.y + rect.h) {
      startDrag('move', e)
    }
  }

  const doCrop = useCallback(() => {
    if (!rect || !imgRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(rect.w)
    canvas.height = Math.round(rect.h)
    const ctx = canvas.getContext('2d')

    const img = imgRef.current
    ctx.drawImage(
      img,
      rect.x, rect.y, rect.w, rect.h,
      0, 0, canvas.width, canvas.height,
    )
    onCropComplete(canvas.toDataURL('image/jpeg', 0.85))
  }, [rect, onCropComplete])

  // Overlay rect in display px (relative to the image wrapper)
  const overlay = rect && imgRef.current ? (() => {
    const imgRect = imgRef.current.getBoundingClientRect()
    // Since the img fills its wrapper 100%, display coords = (pixel / natural) * displaySize
    const sX = displaySize.w / imgNatural.w
    const sY = displaySize.h / imgNatural.h
    return {
      left: rect.x * sX,
      top: rect.y * sY,
      width: rect.w * sX,
      height: rect.h * sY,
    }
  })() : null

  const handleStyle = (pos) => {
    const base = 'absolute w-6 h-6 bg-white rounded-full border-2 border-black/30 shadow -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10'
    const posMap = {
      nw: 'top-0 left-0 cursor-nw-resize',
      ne: 'top-0 left-full cursor-ne-resize',
      sw: 'top-full left-0 cursor-sw-resize',
      se: 'top-full left-full cursor-se-resize',
      n: 'top-0 left-1/2 cursor-n-resize',
      s: 'top-full left-1/2 cursor-s-resize',
      w: 'top-1/2 left-0 cursor-w-resize',
      e: 'top-1/2 left-full cursor-e-resize',
    }
    return `${base} ${posMap[pos] || ''}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 text-white flex-shrink-0">
        <button onClick={onCancel} className="text-sm">取消</button>
        <span className="text-sm font-medium">自由裁剪（拖拽四角或四边调整）</span>
        <button onClick={doCrop} className="text-sm text-primary-300 font-medium">完成</button>
      </div>

      {/* Image + overlay — contained in a wrapper that matches display size */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden p-4">
        <div
          className="relative"
          style={{ width: displaySize.w, height: displaySize.h }}
          onPointerDown={startMove}
        >
          <img
            ref={imgRef}
            src={image}
            alt="crop"
            className="w-full h-full object-contain block"
            onLoad={handleImgLoad}
            draggable={false}
          />

          {imgLoaded && overlay && (
            <>
              {/* Dark masks */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                {/* top mask */}
                <div className="absolute bg-black/50" style={{ top: 0, left: 0, right: 0, height: overlay.top }} />
                {/* bottom mask */}
                <div className="absolute bg-black/50" style={{ top: overlay.top + overlay.height, left: 0, right: 0, bottom: 0 }} />
                {/* left mask */}
                <div className="absolute bg-black/50" style={{ top: overlay.top, left: 0, width: overlay.left, height: overlay.height }} />
                {/* right mask */}
                <div className="absolute bg-black/50" style={{ top: overlay.top, left: overlay.left + overlay.width, right: 0, height: overlay.height }} />
              </div>

              {/* Crop border */}
              <div
                className="absolute border-2 border-white pointer-events-none"
                style={{ zIndex: 6, left: overlay.left, top: overlay.top, width: overlay.width, height: overlay.height }}
              />

              {/* Handles */}
              <div style={{ zIndex: 7 }}>
                {['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'].map((pos) => (
                  <div
                    key={pos}
                    className={handleStyle(pos)}
                    onPointerDown={(e) => startDrag(pos, e)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }
