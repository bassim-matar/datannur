import { describe, it, expect } from 'vitest'
import { get_time_ago } from '@lib/Time'

const sameDateMultipleTimes = [
  [new Date(2023, 10, 25, 0, 30, 0)],
  [new Date(2023, 10, 25, 3, 0, 0)],
  [new Date(2023, 10, 25, 12, 0, 0)],
  [new Date(2023, 10, 25, 15, 30, 0)],
  [new Date(2023, 10, 25, 21, 45, 0)],
  [new Date(2023, 10, 25, 23, 45, 0)],
]

describe('Time', () => {
  it.each(sameDateMultipleTimes)(
    'should work with param day = true',
    dateNow => {
      const dates = [
        ['2023/11/25', "aujourd'hui"],
        ['2023/11/24', 'hier'],
        ['2023/11/23', 'avant-hier'],
        ['2023/11/22', 'il y a 3 jours'],
        ['2023/11/21', 'il y a 4 jours'],
        ['2023/11/20', 'il y a 5 jours'],
        ['2023/11/19', 'il y a 6 jours'],
        ['2023/11/18', 'la semaine dernière'],
        ['2023/11/17', 'la semaine dernière'],
        ['2023/11/16', 'la semaine dernière'],
      ]
      dates.forEach(([date, expected]) => {
        const result = get_time_ago(date, true, true, dateNow)
        expect(result).toBe(expected)
      })
    }
  )
})
