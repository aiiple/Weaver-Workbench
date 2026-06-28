export default function ProjectActions({ status, onComplete, onRestart }) {
  return (
    <div className="flex gap-3">
      {status === 'active' && (
        <div className="flex-1 flex flex-col items-center gap-1">
          <button
            onClick={onComplete}
            className="w-full py-3 bg-green-500 text-white rounded-xl text-sm font-semibold active:bg-green-600 active:scale-[0.98] transition-transform"
          >
            完成项目
          </button>
          <span className="text-[10px] text-gray-400">作品数 +1</span>
        </div>
      )}
      <div className="flex-1 flex flex-col items-center gap-1">
        <button
          onClick={onRestart}
          className={`w-full py-3 text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform ${
            status === 'completed'
              ? 'bg-primary-500 text-white active:bg-primary-600'
              : 'bg-amber-100 text-amber-800 active:bg-amber-200'
          }`}
        >
          重新开始
        </button>
        <span className="text-[10px] text-gray-400">
          {status === 'completed' ? '清零并开始新一轮' : '清零当前进度'}
        </span>
      </div>
    </div>
  )
}
