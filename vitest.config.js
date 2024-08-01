import { defineConfig } from "vitest/config"
import fs from "fs"
import path from "path"

const jsconfig = JSON.parse(fs.readFileSync("./jsconfig.json", "utf-8"))

const alias = Object.fromEntries(
  Object.entries(jsconfig.compilerOptions.paths).map(([key, value]) => [
    key.replace("/*", ""),
    path.resolve(__dirname, value[0].replace("/*", "")),
  ])
)

export default defineConfig({
  test: {
    include: ["test/**/*.test.js"],
  },
  resolve: { alias },
})
