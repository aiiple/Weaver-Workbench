import dayjs from 'dayjs'

/** Format today as YYYY-MM-DD */
export function todayStr() {
  return dayjs().format('YYYY-MM-DD')
}

/** Format timestamp to readable date */
export function formatDate(ts) {
  return dayjs(ts).format('YYYY-MM-DD HH:mm')
}

/** Format timestamp to short date */
export function formatShortDate(ts) {
  return dayjs(ts).format('MM-DD')
}

/** Smart relative time: 今天 14:32 / 昨天 18:20 / 6月25日 */
export function formatRelativeTime(ts) {
  const d = dayjs(ts)
  const now = dayjs()
  if (d.isSame(now, 'day')) {
    return `今天 ${d.format('HH:mm')}`
  }
  if (d.isSame(now.subtract(1, 'day'), 'day')) {
    return `昨天 ${d.format('HH:mm')}`
  }
  return d.format('M月D日 HH:mm')
}

/** Get all days in a month with padding for calendar grid */
export function getMonthDays(year, month) {
  const firstDay = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`)
  const startDay = firstDay.day() // 0=Sun
  const daysInMonth = firstDay.daysInMonth()
  const days = []

  // Padding days before the 1st
  for (let i = 0; i < startDay; i++) {
    days.push({ date: '', day: 0, isPadding: true })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = firstDay.date(d).format('YYYY-MM-DD')
    days.push({ date: dateStr, day: d, isPadding: false })
  }

  return days
}
