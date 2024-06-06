import fs from "fs"

const jsconfig = JSON.parse(fs.readFileSync("./jsconfig.json", "utf-8"))

export default {
  testMatch: ["<rootDir>/test/**/*.test.js"],
  moduleNameMapper: {
    ...Object.fromEntries(
      Object.entries(jsconfig.compilerOptions.paths).map(([key, value]) => [
        `^${key.replace(/\*$/, "(.*)")}$`,
        `<rootDir>/${value[0].replace(/\*$/, "$1")}`,
      ])
    ),
  },
}
