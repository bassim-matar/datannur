type ValueType = number | string | '__empty__'

type ValueEntry = {
  start: ValueType
  end: ValueType
  count: number
}

export default class Histogram {
  static getRanges(data: (number | null | undefined)[], numGroups = 12) {
    const cleanedData: number[] = data.filter(
      (value): value is number =>
        value !== null &&
        value !== undefined &&
        typeof value !== 'string' &&
        value !== 0,
    )

    const ranges = [
      { start: '__empty__', end: '__empty__', count: 0 },
      { start: 0, end: 0, count: 0 },
    ]

    if (cleanedData.length === 0) return ranges

    cleanedData.sort((a, b) => a - b)

    const minValue = cleanedData[0]
    const maxValue = cleanedData[cleanedData.length - 1]

    function fromLog(value: number) {
      return Math.pow(10, value)
    }

    function toLog(value: number) {
      return Math.log10(value)
    }

    const logMinValue = toLog(minValue)
    const logMaxValue = toLog(maxValue)

    let currentLogMinValue = logMinValue
    for (let i = 0; i < numGroups - 3; i++) {
      const rangeSize = (logMaxValue - currentLogMinValue) / (numGroups - 2 - i)
      const groupLogMaxValue = currentLogMinValue + rangeSize

      const groupMinValue = Math.round(fromLog(currentLogMinValue))
      const groupMaxValue = Math.round(fromLog(groupLogMaxValue)) - 1

      if (groupMinValue > groupMaxValue) continue

      ranges.push({
        start: groupMinValue,
        end: groupMaxValue,
        count: 0,
      })

      currentLogMinValue = groupLogMaxValue
    }

    const lastGroupMinValue = fromLog(currentLogMinValue)
    const lastGroupMaxValue = fromLog(logMaxValue)
    ranges.push({
      start: Math.round(lastGroupMinValue),
      end: Math.round(lastGroupMaxValue),
      count: 0,
    })

    return ranges
  }

  static addCount(ranges: ValueEntry[], data: (number | null | undefined)[]) {
    let histogram: ValueEntry[] = []
    for (const range of ranges) {
      histogram.push({
        start: range.start,
        end: range.end,
        count: 0,
      })
    }

    for (const value of data) {
      let foundMatch = false

      for (const histogramObj of histogram) {
        if (value === 0) {
          if (histogramObj.start === 0 && histogramObj.end === 0) {
            histogramObj.count++
            foundMatch = true
            break
          }
        } else if (value === null || value === undefined) {
          if (
            histogramObj.start === '__empty__' &&
            histogramObj.end === '__empty__'
          ) {
            histogramObj.count++
            foundMatch = true
            break
          }
        } else if (
          typeof histogramObj.start === 'number' &&
          typeof histogramObj.end === 'number' &&
          value >= histogramObj.start &&
          value <= histogramObj.end
        ) {
          histogramObj.count++
          foundMatch = true
          break
        }
      }

      if (!foundMatch) {
        console.error(`Histogram.addCount() !foundMatch`, value)
      }
    }

    histogram = histogram.filter(
      histogramObj =>
        (histogramObj.start !== '__empty__' && histogramObj.start !== 0) ||
        histogramObj.count > 0,
    )

    return histogram
  }

  static get(allValues: (number | null | undefined)[], nbRange: number) {
    const ranges = this.getRanges(allValues, nbRange)
    return this.addCount(ranges, allValues)
  }
}
