const cache: Record<string, unknown[]> = {}

export default {
  get: (key: string) => cache[key],
  set: (key: string, value: unknown[]) => (cache[key] = value),
  has: (key: string) => key in cache,
  clear: () => Object.keys(cache).forEach(key => delete cache[key]),
}
