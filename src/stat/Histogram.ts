export default class Histogram {
  static get_ranges(data, numGroups = 12) {
    const cleanedData = data.filter(
      value =>
        value !== null &&
        value !== undefined &&
        typeof value !== "string" &&
        value !== 0
    )

    const ranges = [
      { start: "__empty__", end: "__empty__" },
      { start: 0, end: 0 },
    ]

    if (cleanedData.length === 0) return ranges

    cleanedData.sort((a, b) => a - b)

    const minValue = cleanedData[0]
    const maxValue = cleanedData[cleanedData.length - 1]

    function from_log(value) {
      return Math.pow(10, value)
    }

    function to_log(value) {
      return Math.log10(value)
    }

    const logMinValue = to_log(minValue)
    const logMaxValue = to_log(maxValue)

    let currentLogMinValue = logMinValue
    for (let i = 0; i < numGroups - 3; i++) {
      const rangeSize = (logMaxValue - currentLogMinValue) / (numGroups - 2 - i)
      const groupLogMaxValue = currentLogMinValue + rangeSize

      const groupMinValue = Math.round(from_log(currentLogMinValue))
      const groupMaxValue = Math.round(from_log(groupLogMaxValue)) - 1

      if (groupMinValue > groupMaxValue) continue

      ranges.push({
        start: groupMinValue,
        end: groupMaxValue,
      })

      currentLogMinValue = groupLogMaxValue
    }

    const lastGroupMinValue = from_log(currentLogMinValue)
    const lastGroupMaxValue = from_log(logMaxValue)
    ranges.push({
      start: Math.round(lastGroupMinValue),
      end: Math.round(lastGroupMaxValue),
    })

    return ranges
  }

  static add_count(ranges, data) {
    let histogram = []
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
        } else if (value === null || value === undefined || value === "") {
          if (
            histogramObj.start === "__empty__" &&
            histogramObj.end === "__empty__"
          ) {
            histogramObj.count++
            foundMatch = true
            break
          }
        } else if (value >= histogramObj.start && value <= histogramObj.end) {
          histogramObj.count++
          foundMatch = true
          break
        }
      }

      if (!foundMatch) {
        console.log(`error count_groups_values() !foundMatch`, value)
      }
    }

    histogram = histogram.filter(
      histogramObj =>
        (histogramObj.start !== "__empty__" && histogramObj.start !== 0) ||
        histogramObj.count > 0
    )

    return histogram
  }

  static get(all_values, nb_range) {
    const ranges = this.get_ranges(all_values, nb_range)
    return this.add_count(ranges, all_values)
  }
}
