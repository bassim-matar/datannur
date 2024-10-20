import {
  is_mobile,
  link,
  wrap_long_text,
  get_percent,
  pluralize,
} from "@js/util"
import {
  get_time_ago,
  get_datetime,
  date_to_timestamp,
  get_datetime_sortable,
} from "@js/Time"
import { entity_names, entity_to_icon } from "@js/constant"
import Render from "@js/Render"

export default class Column {
  static id() {
    return { data: "id", visible: false, title: "id" }
  }
  static name(entity, name, option) {
    const icon = entity || "name"
    const title_name = name || "Nom"
    if (option === undefined) option = {}
    if (!("with_link" in option)) option.with_link = true
    return {
      data: "name",
      title: Render.icon(icon) + title_name,
      name: "name",
      tooltip: "Nom de l'entité: " + title_name,
      render: (data, type, row) => {
        let indent = false
        let text
        if (!option.with_link) {
          text = data
        } else if (option.with_indent && !row.no_indent) {
          text = link(row._entity + "/" + row.id, data)
          indent = row?.parents_relative?.length - row?.minimum_deep
        } else {
          text = link(row._entity + "/" + row.id, data)
        }
        if (option.link_same_entity_tab && row.nb_child > 0) {
          text = link(
            row._entity + "/" + row.id + "?tab=" + row._entity + "s",
            data
          )
        }
        text = `<strong class="var_main_col">${text}</strong>`
        return wrap_long_text(text, indent)
      },
    }
  }
  static original_name() {
    return {
      data: "original_name",
      title: Render.icon("name") + "Nom d'origine",
      render: data => wrap_long_text(data),
    }
  }
  static entity() {
    return {
      data: "_entity",
      name: "entity",
      title: Render.icon("entity") + "Entité",
      defaultContent: "",
      filter_type: "select",
      render: (data, type, row) => {
        if (type === "sort" || type === "export" || type === "filter") {
          return data
        }
        return `
          <span class="icon icon_${data}">
            <i class="fas fa-${entity_to_icon[data] || data}"></i>
          </span>
          <span>${entity_names[data]}</span>`
      },
    }
  }
  static folder(folder_id_var = "folder_id", folder_name_var = "folder_name") {
    const render = (
      data,
      type,
      { [folder_id_var]: folder_id, [folder_name_var]: folder_name }
    ) =>
      is_mobile
        ? wrap_long_text(link("folder/" + folder_id, folder_name))
        : Render.with_parents_from_id("folder", folder_id, type)
    return {
      data: folder_name_var,
      title: Render.icon("folder") + "Dossier",
      defaultContent: "",
      render,
    }
  }
  static folder_simple() {
    return {
      data: "folder_id",
      title: Render.icon("folder") + "Dossier",
      defaultContent: "",
      render: (data, _, row) => {
        if (!data) return ""
        return wrap_long_text(link("folder/" + data, row.folder_name))
      },
    }
  }
  static parents() {
    const render = is_mobile ? Render.first_parent : Render.parents_indent
    return {
      data: "parents",
      title: Render.icon("folder_tree") + "Partie de",
      render,
    }
  }
  static datatype() {
    return {
      data: "type_clean",
      title: Render.icon("type") + "Type",
      defaultContent: "",
      name: "type",
      filter_type: "select",
    }
  }
  static description() {
    return {
      data: "description",
      defaultContent: "",
      title: Render.icon("description") + "Description",
      render: data => wrap_long_text(data),
    }
  }
  static tag() {
    return {
      data: "tags",
      title: Render.icon("tag") + "Mots clés",
      defaultContent: "",
      render: Render.tags,
    }
  }
  static owner() {
    const render = (data, type, { owner_id, owner_name }) =>
      is_mobile
        ? wrap_long_text(link(`institution/${owner_id}`, owner_name))
        : Render.with_parents_from_id("institution", owner_id, type)
    return {
      data: "owner_name",
      title: Render.icon("institution") + entity_names.owner,
      defaultContent: "",
      render,
    }
  }
  static manager() {
    const render = (data, type, { manager_id, manager_name }) =>
      is_mobile
        ? wrap_long_text(link(`institution/${manager_id}`, manager_name))
        : Render.with_parents_from_id("institution", manager_id, type)
    return {
      data: "manager_name",
      title: Render.icon("institution") + entity_names.manager,
      defaultContent: "",
      render,
    }
  }
  static modality() {
    return {
      data: "modalities",
      title: Render.icon("modality") + "Modalité",
      defaultContent: "",
      render: Render.modalities_name,
    }
  }
  static value() {
    return {
      data: "value",
      defaultContent: "",
      title: Render.icon("value") + "Valeur",
      render: data => wrap_long_text(data),
    }
  }
  static nb_values() {
    return {
      data: "values",
      title: Render.icon("value") + "Nb",
      defaultContent: "",
      filter_type: "input",
      tooltip: "Nombre de valeurs",
      render: Render.nb_values,
    }
  }
  static values_preview() {
    return {
      data: "values_preview",
      title: Render.icon("value") + "Valeurs",
      defaultContent: "",
      render: Render.value,
    }
  }
  static nb_duplicates() {
    return {
      data: "nb_duplicate",
      defaultContent: "",
      filter_type: "input",
      title: Render.icon("duplicate") + "Doublons",
      render: Render.nb_duplicate,
    }
  }
  static nb_missing() {
    return {
      data: "nb_missing",
      defaultContent: "",
      filter_type: "input",
      title: Render.icon("missing") + "Manquant",
      render: Render.nb_missing,
    }
  }
  static nb_row(nb_row_max) {
    return {
      data: "nb_row",
      title: Render.icon("nb_row") + "Lignes",
      filter_type: "input",
      defaultContent: "",
      render: (data, type) => {
        if (!data) return ""
        const percent = get_percent(data / nb_row_max)
        return `${Render.num_percent(data, percent, "nb_row", type)}`
      },
    }
  }
  static frequency() {
    return {
      data: "updating_each",
      defaultContent: "",
      filter_type: "select",
      title: Render.icon("frequency") + "Fréquence",
      render: wrap_long_text,
    }
  }
  static last_update() {
    return {
      data: "last_update_date",
      defaultContent: "",
      title: Render.icon("date") + "Mis à jour",
      filter_type: "input",
      render: data => {
        if (!data) return ""
        return wrap_long_text(`${data}, ${get_time_ago(data, true, true)}`)
      },
    }
  }
  static last_update_timestamp() {
    return {
      data: "last_update_timestamp",
      title: Render.icon("date") + "Mis à jour",
      defaultContent: "",
      filter_type: "input",
      render: data => {
        if (!data) return ""
        return wrap_long_text(`${get_datetime_sortable(data * 1000)}`)
      },
    }
  }
  static last_update_time_ago() {
    return {
      data: "last_update_timestamp",
      title: Render.icon("date") + "Moment",
      defaultContent: "",
      filter_type: "input",
      render: data => {
        if (!data) return ""
        return wrap_long_text(`${get_time_ago(data * 1000)}`)
      },
    }
  }

  static favorite() {
    return {
      data: "is_favorite",
      title: Render.icon("favorite") + "<span class='hidden'>favorite</span>",
      name: "is_favorite",
      width: "20px",
      tooltip: "Favoris",
      filter_type: "select",
      render: Render.favorite,
    }
  }
  static level() {
    return {
      data: "parents",
      title: Render.icon("level") + "<span class='hidden'>level</span>",
      defaultContent: "",
      name: "level",
      filter_type: "input",
      width: "20px",
      tooltip: "Niveau de profondeur de l'arborecence",
      render: data => data.length + 1,
    }
  }
  static localisation() {
    return {
      data: "localisation",
      title: Render.icon("localisation") + "Localisation",
      defaultContent: "",
      render: wrap_long_text,
    }
  }
  static delivery_format() {
    return {
      data: "delivery_format",
      title: Render.icon("delivery_format") + "Format livraison",
      defaultContent: "",
      filter_type: "select",
    }
  }
  static period() {
    return {
      data: "period",
      title: Render.icon("date_range") + "Période",
      defaultContent: "",
      render: wrap_long_text,
    }
  }
  static start_date() {
    return {
      data: "start_date",
      title: Render.icon("date_range") + "Début",
      defaultContent: "",
      date_type: "start",
      filter_type: "input",
      render: (data, type) => {
        if (!["sort", "filter"].includes(type)) return data
        if (!data) data = 1000
        return date_to_timestamp(data, "start")
      },
    }
  }
  static end_date() {
    return {
      data: "end_date",
      title: Render.icon("date_range") + "Fin",
      defaultContent: "",
      date_type: "end",
      filter_type: "input",
      render: (data, type) => {
        if (!["sort", "filter"].includes(type)) return data
        if (!data) data = 9999
        return date_to_timestamp(data, "end")
      },
    }
  }
  static dataset(parent_name) {
    return {
      data: "dataset_name",
      title: Render.icon("dataset") + "Dataset",
      render: (data, type, row) =>
        wrap_long_text(
          link(parent_name + "/" + row[parent_name + "_id"], data)
        ),
    }
  }
  static data_path() {
    return {
      data: "data_path",
      title: Render.icon("data_path") + "Emplacement",
      defaultContent: "",
      render: Render.copy_cell,
    }
  }
  static doc_path() {
    return {
      data: "path",
      title: Render.icon("link") + "Lien",
      defaultContent: "",
      render: data => {
        return wrap_long_text(`<a href="${data}" target="_blanck">${data}</a>`)
      },
    }
  }
  static nb_doc(entity, total, with_name = false) {
    return {
      data: "docs_recursive",
      title:
        Render.icon("doc") +
        (with_name ? "Docs" : "<span class='hidden'>nb_docs</span>"),
      filter_type: "input",
      defaultContent: "",
      render: (data, type, row) => {
        if (!data.length) return ""
        const content = link(entity + "/" + row.id + "?tab=docs", data.length)
        const percent = get_percent(data.length / total)
        return `${Render.num_percent(content, percent, "doc", type)}`
      },
    }
  }
  static nb_child_recursive(entity, total, link_path = false) {
    if (!link_path) link_path = entity + "/"
    const entity_plural = pluralize(entity)
    return {
      data: "nb_child_recursive",
      title:
        Render.icon(entity) + `<span class='hidden'>nb_${entity_plural}</span>`,
      filter_type: "input",
      render: (data, type, row) => {
        if (!data) return ""
        const content = link(link_path + row.id + `?tab=${entity_plural}`, data)
        const percent = get_percent(data / total)
        return `${Render.num_percent(content, percent, entity, type)}`
      },
    }
  }
  static nb_folder_recursive(entity, total) {
    return {
      data: "nb_folder_recursive",
      title: Render.icon("folder") + "<span class='hidden'>nb_folders</span>",
      filter_type: "input",
      render: (data, type, row) => {
        if (!data) return ""
        const content = link(`${entity}/${row.id}?tab=folders`, data)
        const percent = get_percent(data / total)
        return `${Render.num_percent(content, percent, "folder", type)}`
      },
    }
  }
  static nb_dataset_recursive(entity, total) {
    return {
      data: "nb_dataset_recursive",
      title: Render.icon("dataset") + "<span class='hidden'>nb_datasets</span>",
      filter_type: "input",
      render: (data, type, row) => {
        if (!data) return ""
        const content = link(entity + "/" + row.id + "?tab=datasets", data)
        const percent = get_percent(data / total)
        return `${Render.num_percent(content, percent, "dataset", type)}`
      },
    }
  }
  static nb_variable(entity, total, option) {
    if (!option) option = {}
    if (!("link_path" in option)) option.link_path = entity + "/"
    if (!("tab" in option)) option.tab = "variables"
    if (!("show_title" in option)) option.show_title = false
    const title = option.show_title
      ? "Variables"
      : `<span class='hidden'>nb_variables</span>`
    return {
      data: "nb_variable" + (option.recursive ? "_recursive" : ""),
      title: Render.icon("variable") + title,
      filter_type: "input",
      render: (data, type, row) => {
        if (!data) return ""
        const content = link(
          option.link_path + row.id + `?tab=${option.tab}`,
          data
        )
        const percent = get_percent(data / total)
        return `${Render.num_percent(content, percent, "variable", type)}`
      },
    }
  }
  static metaFolder() {
    return {
      data: "metaFolder_id",
      title: Render.icon("folder") + "Dossier",
      render: data => link("metaFolder/" + data, data),
    }
  }
  static time_ago(var_name = "timestamp") {
    return {
      data: var_name,
      title: Render.icon("time_ago") + "Moment",
      defaultContent: "",
      render: (data, type) => {
        if (!data) return ""
        if (type === "sort" || type === "export") {
          return data
        }
        return get_time_ago(data)
      },
    }
  }
  static timestamp(var_name = "timestamp") {
    return {
      data: var_name,
      title: Render.icon("date") + "Date et heure",
      defaultContent: "",
      render: data => (data ? get_datetime(data) : ""),
    }
  }
}
