import PlaceholderCover from '../ui/PlaceholderCover'

export default function DiagramCard({ diagram, onClick, onEdit, onDelete }) {
  return (
    <div onClick={onClick} className="active:scale-[0.98] transition-transform cursor-pointer relative">
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
        {diagram.coverImage ? (
          <img src={diagram.coverImage} alt={diagram.name} className="w-full h-full object-cover" />
        ) : (
          <PlaceholderCover className="w-full h-full" />
        )}
      </div>
      <p className="mt-1.5 text-sm font-medium text-gray-800 truncate">{diagram.name}</p>
      <div className="absolute top-1 right-1 flex gap-1">
        {onEdit && (
          <button onClick={(e) => { e.stopPropagation(); onEdit() }} className="w-6 h-6 bg-white/90 rounded-full text-xs text-gray-600 shadow active:bg-white flex items-center justify-center">✎</button>
        )}
        {onDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="w-6 h-6 bg-white/90 rounded-full text-xs text-red-500 shadow active:bg-white flex items-center justify-center">✕</button>
        )}
      </div>
    </div>
  )
}
