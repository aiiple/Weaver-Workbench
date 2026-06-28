import { useNavigate } from 'react-router-dom'
import PlaceholderCover from '../ui/PlaceholderCover'
import { formatRelativeTime } from '../../utils/date'

export default function ProjectCard({ project, diagram, onEdit, onDelete }) {
  const navigate = useNavigate()
  const cover = project.coverImage || diagram?.coverImage || null
  const isCompleted = project.status === 'completed'

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 active:bg-gray-50 cursor-pointer relative shadow-sm"
    >
      {/* Cover — fixed square on the left */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {cover ? (
          <img src={cover} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <PlaceholderCover className="w-full h-full" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{project.name}</h3>
          {isCompleted && (
            <span className="flex-shrink-0 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
              已完成
            </span>
          )}
        </div>

        {isCompleted ? (
          <p className="text-xs text-gray-400 mt-1">
            完工：{formatRelativeTime(project.updatedAt)}
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-primary-600 mt-1 tabular-nums">
              第 {project.currentRow} 行 | {project.currentStitch} 针
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              上一次钩织：{formatRelativeTime(project.updatedAt)}
            </p>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute top-1 right-1 flex gap-1">
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="w-6 h-6 bg-white/90 rounded-full text-xs text-gray-500 shadow active:bg-white flex items-center justify-center"
          >
            ✎
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="w-6 h-6 bg-white/90 rounded-full text-xs text-red-500 shadow active:bg-white flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
