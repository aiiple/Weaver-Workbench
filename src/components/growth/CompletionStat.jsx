export default function CompletionStat({ count }) {
  return (
    <div className="bg-gradient-to-br from-primary-500 to-pink-500 rounded-2xl p-6 text-white text-center">
      <p className="text-sm opacity-80">累计完成作品</p>
      <p className="text-5xl font-bold mt-2 tabular-nums">{count}</p>
      <p className="text-xs opacity-60 mt-1">件</p>
    </div>
  )
}
