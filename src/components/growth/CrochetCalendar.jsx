import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { getMonthDays } from '../../utils/date'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function CrochetCalendar({ records }) {
  const [currentDate, setCurrentDate] = useState(dayjs())

  const year = currentDate.year()
  const month = currentDate.month() // 0-indexed

  const recordDates = useMemo(() => {
    const set = new Set(records.map((r) => r.date))
    return set
  }, [records])

  const days = useMemo(() => getMonthDays(year, month), [year, month])

  const prevMonth = () => setCurrentDate((d) => d.subtract(1, 'month'))
  const nextMonth = () => setCurrentDate((d) => d.add(1, 'month'))

  // Don't allow going past current month
  const canNext = currentDate.isBefore(dayjs(), 'month')

  return (
    <div>
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 text-gray-400 active:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {year}年 {month + 1}月
        </span>
        <button
          onClick={nextMonth}
          disabled={!canNext}
          className={`p-1 ${canNext ? 'text-gray-400 active:text-gray-600' : 'text-gray-200'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const hasRecord = day.date && recordDates.has(day.date)
          const isToday = day.date === dayjs().format('YYYY-MM-DD')

          return (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                day.isPadding
                  ? 'text-transparent'
                  : hasRecord
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-500'
              } ${isToday && !hasRecord ? 'bg-gray-100' : ''}`}
            >
              {day.day || ''}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
        <div className="w-3 h-3 rounded bg-primary-100" />
        <span>有钩织记录</span>
      </div>
    </div>
  )
}
