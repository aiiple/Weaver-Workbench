import { useState, useEffect, useMemo } from 'react'
import { getAllProjects, getAllRecords } from '../db'
import useAppStore from '../store/useAppStore'
import CompletionStat from '../components/growth/CompletionStat'
import CrochetCalendar from '../components/growth/CrochetCalendar'

export default function GrowthPage() {
  const refreshKey = useAppStore((s) => s.refreshKey)
  const [projects, setProjects] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([getAllProjects(), getAllRecords()]).then(([p, r]) => {
      if (!cancelled) {
        setProjects(p)
        setRecords(r)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  const totalCompleted = useMemo(
    () => projects.reduce((sum, p) => sum + (p.completionCount || 0), 0),
    [projects]
  )

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">成长</h1>
      </div>

      <div className="flex-1 px-4 pb-24 space-y-6">
        <CompletionStat count={totalCompleted} />

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">钩织日历</h3>
          <CrochetCalendar records={records} />
        </div>
      </div>
    </div>
  )
}
