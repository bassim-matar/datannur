import { locale } from '@lib/constant'

export function convertQuarterToFullDate(completeDate, mode = 'start') {
  const quarter = completeDate[5]
  completeDate = completeDate.slice(0, 4)
  if (mode === 'start') {
    if (quarter === '1') completeDate += '/01'
    else if (quarter === '2') completeDate += '/04'
    else if (quarter === '3') completeDate += '/07'
    else if (quarter === '4') completeDate += '/10'
    completeDate += '/01'
  } else if (mode === 'end') {
    if (quarter === '1') completeDate += '/03'
    else if (quarter === '2') completeDate += '/06'
    else if (quarter === '3') completeDate += '/09'
    else if (quarter === '4') completeDate += '/12'
    completeDate += '/30'
  }
  return completeDate
}

export function dateToTimestamp(date, mode = 'start') {
  let completeDate = date
  if (!completeDate) return 0
  if (completeDate.length === 4) {
    if (mode === 'start') completeDate += '/01'
    if (mode === 'end') completeDate += '/12'
  }
  if (completeDate.length === 7) {
    if (mode === 'start') completeDate += '/01'
    if (mode === 'end') completeDate += '/30'
  }

  if (completeDate.length === 6 && completeDate[4] === 't') {
    completeDate = convertQuarterToFullDate(completeDate, mode)
  }
  return Date.parse(completeDate)
}

export function timestampToDate(timestamp) {
  const date = new Date(timestamp)
  return date.toISOString().slice(0, 10).replaceAll('-', '/')
}

const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
const divisions: {
  amount: number
  name: Intl.RelativeTimeFormatUnit
  localName: string
}[] = [
  { amount: 60, name: 'seconds', localName: 'seconde' },
  { amount: 60, name: 'minutes', localName: 'minute' },
  { amount: 24, name: 'hours', localName: 'heure' },
  { amount: 7, name: 'days', localName: 'jour' },
  { amount: 4.34524, name: 'weeks', localName: 'semaine' },
  { amount: 12, name: 'months', localName: 'mois' },
  { amount: Number.POSITIVE_INFINITY, name: 'years', localName: 'an' },
]

export function getDatetime(timestamp, withSecond = false) {
  const date = new Date(timestamp)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  if (withSecond) {
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
  }
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

export function getTimeAgo(
  date,
  parse = false,
  day = false,
  dateNow = new Date(),
) {
  if (!date) return ''
  if (parse) date = Date.parse(date)
  if (day) dateNow.setHours(0, 0, 0, 0)
  let duration = (Number(date) - Number(dateNow)) / 1000
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
      const roundDuration = Math.round(duration)
      let unit = division.localName
      if (roundDuration > 1 && !unit.endsWith('s')) unit += 's'
      return roundDuration + ' ' + unit
    }
    duration /= division.amount
  }
}
