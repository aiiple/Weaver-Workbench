import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

export default function ImageCropper({ image, aspect, title, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const isFreeRatio = aspect === undefined || aspect === null

  const onCropChange = (_, croppedArea) => {
    setCroppedAreaPixels(croppedArea)
  }

  const getCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return null
    const img = new Image()
    img.src = image
    await new Promise((resolve) => { img.onload = resolve })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (isFreeRatio) {
      // Free ratio: preserve the cropped area's natural aspect ratio
      canvas.width = Math.round(croppedAreaPixels.width)
      canvas.height = Math.round(croppedAreaPixels.height)
    } else {
      // Fixed 1:1: output a uniform square
      canvas.width = 300
      canvas.height = 300
    }

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    return canvas.toDataURL('image/jpeg', 0.85)
  }, [image, croppedAreaPixels, isFreeRatio])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex justify-between items-center px-4 py-3 text-white">
        <button onClick={onCancel} className="text-sm">取消</button>
        <span className="text-sm font-medium">{title || '裁剪封面'}</span>
        <button
          onClick={async () => {
            const result = await getCroppedImage()
            if (result) onCropComplete(result)
          }}
          className="text-sm text-primary-300 font-medium"
        >
          完成
        </button>
      </div>
      <div className="flex-1 relative">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={isFreeRatio ? undefined : (aspect || 1)}
          onCropChange={setCrop}
          onCropComplete={onCropChange}
          onZoomChange={setZoom}
        />
      </div>
    </div>
  )
}
