<script>
  import db from "@db"
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"

  let { variables, is_meta = false } = $props()

  const parent_name = is_meta ? "metaDataset" : "dataset"

  let dataset_has_type = false
  let nb_row_max = 0
  let nb_value_max = 0

  for (const variable of variables) {
    variable.dataset_name = "[error not found]"
    const dataset = db.get(parent_name, variable[parent_name + "_id"])
    if (!dataset) {
      console.error(
        `dataset not found: ${variable[parent_name + "_id"]} for variable`,
        variable,
      )
      continue
    }
    dataset_has_type = dataset.hasOwnProperty("type")
    variable.dataset_name = dataset.name
    variable.nb_row = dataset.nb_row
    nb_row_max = Math.max(nb_row_max, dataset.nb_row)
    nb_value_max = Math.max(nb_value_max, variable.nb_value)

    if (is_meta) {
      variable.metaFolder_id = dataset.metaFolder_id
    } else {
      if (db.use.owner) {
        variable.owner_id = dataset.owner_id
        variable.owner_name = dataset.owner_name
      }
      if (db.use.manager) {
        variable.manager_id = dataset.manager_id
        variable.manager_name = dataset.manager_name
      }
      variable.folder_id = dataset.folder_id
      variable.folder_name = dataset.folder_name
      variable.dataset_type = dataset.type
    }
  }

  const variables_sorted = [...variables]
  if (!is_meta && variables.length > 0 && dataset_has_type) {
    const filters = db.get_all("filter")
    const filter_to_position = {}
    for (const i in filters) {
      filter_to_position[filters[i].id] = i
    }
    variables_sorted.sort(
      (a, b) =>
        filter_to_position[a.dataset_type] -
          filter_to_position[b.dataset_type] ||
        a.folder_name.localeCompare(b.folder_name) ||
        a.dataset_name.localeCompare(b.dataset_name) ||
        a.num - b.num,
    )
  }

  if (is_meta && variables.length > 0) {
    variables_sorted.sort(
      (a, b) =>
        a.metaFolder_id.localeCompare(b.metaFolder_id) ||
        a.dataset_name.localeCompare(b.dataset_name) ||
        a.num - b.num,
    )
  }

  function define_columns() {
    const base = [
      Column.name("variable", "Variable", { is_meta }),
      Column.original_name(),
      Column.description(),
      Column.datatype(),
      Column.nb_row(nb_row_max),
      Column.nb_missing(),
      Column.nb_duplicates(),
      Column.nb_values(nb_value_max),
      Column.values_preview(),
    ]
    if (is_meta) {
      return [...base, Column.dataset(parent_name), Column.metaFolder()]
    }
    return [
      ...base,
      Column.modality(),
      Column.dataset(parent_name),
      Column.folder(),
      Column.owner(),
      Column.manager(),
      Column.tag(),
      Column.start_date(),
      Column.end_date(),
      Column.favorite(),
    ]
  }

  const columns = define_columns()
</script>

{#if variables.length > 0}
  <Datatable
    entity="variable"
    data={variables_sorted}
    {columns}
    sort_by_name={false}
    meta_path={is_meta ? "metaVariable/" : false}
  />
{/if}
