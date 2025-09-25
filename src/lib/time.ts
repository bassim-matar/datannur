import { locale } from '@lib/constant'

export function convertQuarterToFullDate(complete_date, mode = 'start') {
  const quarter = complete_date[5]
  complete_date = complete_date.slice(0, 4)
  if (mode === 'start') {
    if (quarter === '1') complete_date += '/01'
    else if (quarter === '2') complete_date += '/04'
    else if (quarter === '3') complete_date += '/07'
    else if (quarter === '4') complete_date += '/10'
    complete_date += '/01'
  } else if (mode === 'end') {
    if (quarter === '1') complete_date += '/03'
    else if (quarter === '2') complete_date += '/06'
    else if (quarter === '3') complete_date += '/09'
    else if (quarter === '4') complete_date += '/12'
    complete_date += '/30'
  }
  return complete_date
}

export function dateToTimestamp(date, mode = 'start') {
  let complete_date = date
  if (!complete_date) return 0
  if (complete_date.length === 4) {
    if (mode === 'start') complete_date += '/01'
    if (mode === 'end') complete_date += '/12'
  }
  if (complete_date.length === 7) {
    if (mode === 'start') complete_date += '/01'
    if (mode === 'end') complete_date += '/30'
  }

  if (complete_date.length === 6 && complete_date[4] === 't') {
    complete_date = convertQuarterToFullDate(complete_date, mode)
  }
  return Date.parse(complete_date)
}

export function timestampToDate(timestamp) {
  const date = new Date(timestamp)
  return date.toISOString().slice(0, 10).replaceAll('-', '/')
}

const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
const divisions: {
  amount: number
  name: Intl.RelativeTimeFormatUnit
  local_name: string
}[] = [
  { amount: 60, name: 'seconds', local_name: 'seconde' },
  { amount: 60, name: 'minutes', local_name: 'minute' },
  { amount: 24, name: 'hours', local_name: 'heure' },
  { amount: 7, name: 'days', local_name: 'jour' },
  { amount: 4.34524, name: 'weeks', local_name: 'semaine' },
  { amount: 12, name: 'months', local_name: 'mois' },
  { amount: Number.POSITIVE_INFINITY, name: 'years', local_name: 'an' },
]

export function getDatetime(timestamp, with_second = false) {
  const date = new Date(timestamp)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  if (with_second) {
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
  }
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

export function getTimeAgo(
  date,
  parse = false,
  day = false,
  date_now = new Date(),
) {
  if (!date) return ''
  if (parse) date = Date.parse(date)
  if (day) date_now.setHours(0, 0, 0, 0)
  let duration = (Number(date) - Number(date_now)) / 1000
  if (day && duration === 0) return "aujourd'hui"
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name)
    }
    duration /= division.amount
  }
}

export function getPeriod(start, end, parse = false) {
  if (!start || !end) return ''
  if (parse) {
    if (start.length === 4) start += '/01'
    if (start.length === 7) start += '/01'
    if (end.length === 4) end += '/12'
    if (end.length === 7) end += '/30'
    if (start.length === 6 && start[4] === 't') {
      start = convertQuarterToFullDate(start, 'start')
    }
    if (end.length === 6 && end[4] === 't') {
      end = convertQuarterToFullDate(end, 'end')
    }
    start = Date.parse(start)
    end = Date.parse(end)
    if (end - start < 10 * 24 * 3600 * 1000) end += 1 * 24 * 3600 * 1000
    else end += 3 * 24 * 3600 * 1000
  }
  let duration = (end - start) / 1000
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      const round_duration = Math.round(duration)
      let unit = division.local_name
      if (round_duration > 1 && !unit.endsWith('s')) unit += 's'
      return round_duration + ' ' + unit
    }
    duration /= division.amount
  }
}
