import type { Row } from '@type'

const cache: Record<string, Row[]> = {}

export default {
  get: (key: string) => cache[key],
  set: (key: string, value: Row[]) => (cache[key] = value),
  has: (key: string) => key in cache,
  clear: () => Object.keys(cache).forEach(key => delete cache[key]),
}
