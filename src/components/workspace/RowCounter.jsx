export default function RowCounter({ value, onIncrement }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">当前行数</span>
      <span className="text-4xl font-bold text-gray-900 tabular-nums">{value}</span>
      <button
        onClick={onIncrement}
        className="w-full py-3 px-6 bg-primary-500 text-white rounded-xl text-lg font-semibold active:bg-primary-600 active:scale-95 transition-transform select-none"
      >
        +1 行
      </button>
    </div>
  )
}
