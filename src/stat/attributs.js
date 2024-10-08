import definition from "./attributs_def"

const attributs = {
  institution: ["tag", "email", "phone", "level", "name", "description"],
  folder: [
    "frequency",
    "last_update",
    "tag",
    "localisation",
    "survey_type",
    "delivery_format",
    "metadata_path",
    "git_code",
    "level",
    "name",
    "description",
  ],
  tag: ["entity", "level", "name", "description"],
  doc: ["doc_type", "entity", "doc_path", "last_update_doc", "name"],
  dataset: [
    "frequency",
    "last_update",
    "tag",
    "localisation",
    "delivery_format",
    "variable",
    "nb_row",
    "name",
    "description",
  ],
  variable: ["type", "modality", "value", "name", "description"],
  modality: ["type", "variable", "value", "name", "description"],
  log: ["action", "page", "tab", "search", "time_ago"],
}

const attributs_filled = {}
for (const [entity, value] of Object.entries(attributs)) {
  attributs_filled[entity] = value.map(key => {
    if (!(key in definition)) console.error(`key ${key} not found`)
    return { ...definition[key], key }
  })
}

export default attributs_filled
