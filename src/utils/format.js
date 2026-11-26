const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/**
 * Formats an API `date` value (`YYYY-MM-DD`) without timezone drift.
 */
export function formatSessionDate(date) {
  if (typeof date !== 'string' || !date) {
    return ''
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date)

  if (!match) {
    return date
  }

  const [, year, month, day] = match
  const parsed = new Date(Number(year), Number(month) - 1, Number(day))

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return DATE_FORMATTER.format(parsed)
}

/**
 * Formats an API `start_time` value (`HH:MM` or `HH:MM:SS`) as `HH:MM`.
 */
export function formatSessionTime(startTime) {
  if (typeof startTime !== 'string') {
    return ''
  }

  const match = /^(\d{2}):(\d{2})/.exec(startTime)

  return match ? `${match[1]}:${match[2]}` : startTime
}

export function formatDuration(minutes) {
  const value = Number(minutes)

  if (!Number.isFinite(value) || value <= 0) {
    return ''
  }

  if (value < 60) {
    return `${value} min`
  }

  const hours = Math.floor(value / 60)
  const remainder = value % 60

  return remainder ? `${hours} h ${remainder} min` : `${hours} h`
}
