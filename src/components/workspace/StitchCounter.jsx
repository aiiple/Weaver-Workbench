import { useState } from 'react'

export default function StitchCounter({ value, customIncrement, onIncrement, onIncrementN, onCustomChange }) {
  const [editing, setEditing] = useState(false)
  const [tempN, setTempN] = useState(customIncrement)

  const handleEditN = () => {
    setTempN(customIncrement)
    setEditing(true)
  }

  const handleSaveN = () => {
    const n = parseInt(tempN, 10)
    if (n > 0) {
      onCustomChange(n)
    }
    setEditing(false)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">当前针数</span>
      <span className="text-4xl font-bold text-gray-900 tabular-nums">{value}</span>
      <div className="flex gap-2 w-full">
        <button
          onClick={onIncrement}
          className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-xl text-lg font-semibold active:bg-primary-600 active:scale-95 transition-transform select-none"
        >
          +1 针
        </button>
        {editing ? (
          <div className="flex-1 flex gap-1">
            <input
              autoFocus
              type="number"
              min="1"
              value={tempN}
              onChange={(e) => setTempN(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveN()}
              className="w-full px-2 py-3 text-center border border-primary-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button
              onClick={handleSaveN}
              className="px-2 py-3 text-xs text-primary-600 font-medium"
            >
              确定
            </button>
          </div>
        ) : (
          <button
            onClick={() => onIncrementN(customIncrement)}
            className="flex-1 py-3 px-4 bg-primary-100 text-primary-700 rounded-xl text-lg font-semibold active:bg-primary-200 active:scale-95 transition-transform select-none"
            onDoubleClick={handleEditN}
          >
            +{customIncrement} 针
          </button>
        )}
      </div>
      {!editing && (
        <button
          onClick={handleEditN}
          className="text-xs text-gray-400 active:text-primary-500"
        >
          双击按钮或点击此处修改 +N 值
        </button>
      )}
    </div>
  )
}
