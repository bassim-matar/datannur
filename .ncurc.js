const package_json = require("./package.json")

const exact_versions = Object.entries({
  ...package_json.dependencies,
  ...package_json.devDependencies,
})
  .filter(([_, version]) => !/^[\^~]/.test(version))
  .map(([package_name]) => package_name)

module.exports = {
  reject: exact_versions,
}
