import {
  is_mobile,
  link,
  wrap_long_text,
  get_percent,
  pluralize,
} from "@js/util"
import { get_time_ago, get_datetime, date_to_timestamp } from "@js/Time"
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
      tooltip: "Nom",
      filter_type: "input",
      has_long_text: true,
      render: (data, type, row) => {
        let indent = false
        let text
        if (!option.with_link) {
          text = data
        } else if (option.with_indent && !row.no_indent) {
          text = link(row._entity + "/" + row.id, data, row._entity)
          indent = row?.parents_relative?.length - row?.minimum_deep
        } else {
          text = link(row._entity + "/" + row.id, data, row._entity)
        }
        if (option.link_same_entity_tab && row.nb_child > 0) {
          text = link(
            row._entity + "/" + row.id + "?tab=" + row._entity + "s",
            data,
            row._entity
          )
        }
        text = `<strong class="var_main_col">${text}</strong>`
        if (row._deleted) {
          text = `<span class="deleted">${data}</span>`
        }
        return wrap_long_text(text, indent)
      },
    }
  }
  static original_name() {
    return {
      data: "original_name",
      title: Render.icon("name") + "Nom d'origine",
      has_long_text: true,
      filter_type: "input",
      tooltip: "Nom d'origine avant renommage",
      render: data => wrap_long_text(data),
    }
  }
  static entity() {
    return {
      data: "_entity_clean",
      name: "entity",
      title: Render.icon("entity") + "Entité",
      defaultContent: "",
      tooltip: "Entité",
      filter_type: "select",
      render: (data, type, row) => {
        if (!data) return ""
        if (type === "sort" || type === "export" || type === "filter") {
          return data
        }
        return `
          <span class="icon icon_${row._entity}">
            <i class="fas fa-${entity_to_icon[row._entity] || row._entity}"></i>
          </span>
          <span>${data}</span>`
      },
    }
  }
  static parent_entity() {
    return {
      data: "parent_name",
      name: "parent_entity",
      title: Render.icon("entity") + "Partie de",
      defaultContent: "",
      has_long_text: true,
      tooltip: "Partie de l'entité",
      filter_type: "input",
      render: (data, type, row) => {
        if (!data) return ""
        if (type === "sort" || type === "export" || type === "filter") {
          return `${row.parent_entity_clean} | ${row.parent_name}`
        }
        return wrap_long_text(`
          <span class="icon icon_${row.parent_entity}">
            <i class="fas fa-${
              entity_to_icon[row.parent_entity] || row.parent_entity
            }"></i>
          </span>
          <span>${link(
            `${row.parent_entity}/${row.parent_entity_id}`,
            row.parent_name,
            row.parent_entity
          )}</span>`)
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
      has_long_text: true,
      tooltip: "Dossier",
      render,
    }
  }
  static folder_simple() {
    return {
      data: "folder_id",
      title: Render.icon("folder") + "Dossier",
      defaultContent: "",
      has_long_text: true,
      tooltip: "Dossier",
      render: (data, _, row) => {
        if (!data) return ""
        return wrap_long_text(link("folder/" + data, row.folder_name))
      },
    }
  }
  static parents(entity) {
    const render = is_mobile ? Render.first_parent : Render.parents_indent
    return {
      data: "parents",
      title: Render.icon(`folder_tree_${entity}`) + "Partie de",
      has_long_text: true,
      tooltip: "Eléments parents",
      render,
    }
  }
  static dataset_type() {
    return {
      data: "type_clean",
      title: Render.icon("type") + "Type",
      defaultContent: "",
      name: "type",
      filter_type: "select",
      tooltip: "Type de dataset",
    }
  }
  static datatype() {
    return {
      data: "type_clean",
      title: Render.icon("type") + "Type",
      defaultContent: "",
      name: "type",
      filter_type: "select",
      tooltip: "Type de données",
    }
  }
  static description() {
    return {
      data: "description",
      defaultContent: "",
      title: Render.icon("description") + "Description",
      has_long_text: true,
      filter_type: "input",
      tooltip: "Description",
      render: data => wrap_long_text(data),
    }
  }
  static tag() {
    return {
      data: "tags",
      title: Render.icon("tag") + "Mots clés",
      defaultContent: "",
      has_long_text: true,
      tooltip: "Mots clés directement associés",
      name: "tag",
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
      has_long_text: true,
      tooltip: "Institution propriétaire",
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
      has_long_text: true,
      tooltip: "Institution gestionnaire",
      render,
    }
  }
  static modality() {
    return {
      data: "modalities",
      title: Render.icon("modality") + "Modalité",
      defaultContent: "",
      tooltip: "Modalités",
      render: Render.modalities_name,
    }
  }
  static value() {
    return {
      data: "value",
      defaultContent: "",
      title: Render.icon("value") + "Valeur",
      has_long_text: true,
      tooltip: "Valeur",
      render: data => wrap_long_text(data),
    }
  }
  static nb_values(nb_value_max) {
    return {
      data: "nb_value",
      name: "value",
      title: Render.icon("value") + "Nb",
      defaultContent: "",
      filter_type: "input",
      tooltip: "Nombre de valeurs",
      render: (data, type, row) =>
        Render.nb_values(data, type, row, nb_value_max),
    }
  }
  static values_preview() {
    return {
      data: "values_preview",
      title: Render.icon("value") + "Valeurs",
      has_long_text: true,
      defaultContent: "",
      tooltip: "Valeurs",
      render: Render.value,
    }
  }
  static nb_duplicates() {
    return {
      data: "nb_duplicate",
      defaultContent: "",
      filter_type: "input",
      title: Render.icon("duplicate") + "Doublons",
      tooltip: "Nombre de valeurs dupliquées",
      render: Render.nb_duplicate,
    }
  }
  static nb_missing() {
    return {
      data: "nb_missing",
      defaultContent: "",
      filter_type: "input",
      title: Render.icon("missing") + "Manquant",
      tooltip: "Nombre de valeurs manquantes",
      render: Render.nb_missing,
    }
  }
  static nb_row(nb_row_max) {
    return {
      data: "nb_row",
      title: Render.icon("nb_row") + "Lignes",
      filter_type: "input",
      defaultContent: "",
      tooltip: "Nombre de lignes",
      render: (data, type) => {
        if (type !== "display") {
          return data === "" || data === null ? 0 : parseInt(data)
        }
        if (!data) return ""
        const percent = get_percent(data / nb_row_max)
        return `${Render.num_percent(data, percent, "nb_row", type)}`
      },
    }
  }
  static nb_sources(nb_sources_max, entity) {
    return {
      data: "source_ids",
      title: Render.icon("nb_source") + "In",
      filter_type: "input",
      defaultContent: "",
      tooltip: `Nombre de ${entity}s sources (en amont)`,
      render: (data, type, row) => {
        if (!data || (!data.length && !data.size)) return ""
        const nb = data.length || data.size
        if (type !== "display") return nb
        const percent = get_percent(nb / nb_sources_max)
        const content = link(`${entity}/${row.id}?tab=${entity}s`, nb)
        return `${Render.num_percent(content, percent, "nb_source", type)}`
      },
    }
  }
  static nb_derived(nb_derived_max, entity) {
    return {
      data: "derived_ids",
      title: Render.icon("nb_derived") + "Out",
      filter_type: "input",
      defaultContent: "",
      tooltip: `Nombre de ${entity}s dérivées (en aval)`,
      render: (data, type, row) => {
        if (!data || (!data.length && !data.size)) return ""
        const nb = data.length || data.size
        if (type !== "display") return nb
        const percent = get_percent(nb / nb_derived_max)
        const content = link(`${entity}/${row.id}?tab=${entity}s`, nb)
        return `${Render.num_percent(content, percent, "nb_derived", type)}`
      },
    }
  }
  static frequency() {
    return {
      data: "updating_each",
      name: "frequency",
      defaultContent: "",
      filter_type: "select",
      title: Render.icon("frequency") + "Fréquence",
      tooltip: "Fréquence de mise à jour",
    }
  }
  static last_update() {
    return {
      data: "last_update_date",
      name: "last_update",
      defaultContent: "",
      title: Render.icon("date") + "Mise à jour",
      filter_type: "input",
      tooltip: "Date de dernière mise à jour",
      render: (data, type, row) => Render.datetime(data, type, row),
    }
  }
  static next_update() {
    return {
      data: "next_update_date",
      name: "next_update",
      defaultContent: "",
      title: Render.icon("date") + "Prochaine",
      filter_type: "input",
      tooltip: "Date de prochaine mise à jour estimée",
      render: (data, type, row) =>
        Render.datetime(data, type, row, { estimation: true }),
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
      data: "id",
      title: Render.icon("level") + "<span class='hidden'>level</span>",
      defaultContent: "",
      name: "level",
      filter_type: "input",
      width: "20px",
      tooltip: "Niveau de profondeur de l'arborecence",
      render: (data, type, row) => row.parents?.length + 1,
    }
  }
  static localisation() {
    return {
      data: "localisation",
      title: Render.icon("localisation") + "Localisation",
      defaultContent: "",
      tooltip: "Localisation géographique des données",
      render: data => {
        if (!data) return ""
        return data
      },
    }
  }
  static delivery_format() {
    return {
      data: "delivery_format",
      title: Render.icon("delivery_format") + "Format livraison",
      defaultContent: "",
      filter_type: "select",
      tooltip: "Format de livraison des données",
    }
  }
  static period() {
    return {
      data: "period",
      title: Render.icon("date_range") + "Période",
      defaultContent: "",
      tooltip: "Période couverte par les données",
      render: (data, type, row) => {
        if (!data) return ""
        if (type !== "display") return data
        let text = data
        if (row.period_duration) text += "<br>" + row.period_duration
        return text
      },
    }
  }
  static start_date() {
    return {
      data: "start_date",
      title: Render.icon("date_range") + "Début",
      defaultContent: "",
      date_type: "start",
      filter_type: "input",
      tooltip: "Date de début de validité",
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
      tooltip: "Date de fin de validité",
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
      has_long_text: true,
      tooltip: "Dataset",
      render: (data, type, row) =>
        wrap_long_text(
          link(parent_name + "/" + row[parent_name + "_id"], data, "dataset")
        ),
    }
  }
  static data_path() {
    return {
      data: "data_path",
      title: Render.icon("data_path") + "Emplacement",
      defaultContent: "",
      tooltip: "Emplacement des données",
      render: Render.copy_cell,
    }
  }
  static doc_path() {
    return {
      data: "path",
      name: "doc_path",
      title: Render.icon("link") + "Lien",
      defaultContent: "",
      has_long_text: true,
      tooltip: "Emplacement du doc",
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
      from_length: true,
      tooltip: "Nombre de docs",
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
      tooltip: "Nombre d'éléments de type " + entity,
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
      tooltip: "Nombre de dossiers",
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
      tooltip: "Nombre de datasets",
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
      name: "variable",
      filter_type: "input",
      tooltip: "Nombre de variables",
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
      tooltip: "Dossier",
      render: data => link("metaFolder/" + data, data),
    }
  }
  static timestamp(options) {
    if (!options) options = {}
    if (!("var_name" in options)) options.var_name = "timestamp"
    if (!("title" in options)) options.title = "Moment"
    if (!("tooltip" in options)) options.tooltip = "moment de l'ajout"
    return {
      data: options.var_name,
      title: Render.icon("date") + options.title,
      defaultContent: "",
      type: "num",
      filter_type: "input",
      tooltip: options.tooltip,
      render: (data, type) => {
        if (!data) return ""
        if (type === "sort") return data
        if (type !== "display") return get_datetime(data)
        let datetime = get_datetime(data)
        if (datetime.includes(" 00:00:00") || datetime.includes(" 01:00:00"))
          datetime = datetime.split(" ")[0]

        if (datetime.length > 12) {
          datetime = `<span style="font-size: 12px";>${datetime}</span>`
        }

        let time_ago = get_time_ago(data)

        if (time_ago.length > 18) {
          time_ago = `<span style="font-size: 12px";>${time_ago}</span>`
        }

        const percent = get_percent((new Date().getTime() - data) / 31536000000)
        const entity = percent < 0 ? "value" : "doc"
        const percent_abs_inversed = 100 - Math.abs(percent)
        const content = `${time_ago}<br>${datetime}`
        return `${Render.num_percent(
          content,
          percent_abs_inversed,
          entity,
          type
        )}`
      },
    }
  }
  static is_key() {
    return {
      data: "key",
      title: Render.icon("key") + "Clé",
      defaultContent: "",
      filter_type: "select",
      tooltip: "Clé primaire ou partie de clé primaire",
      render: (data, type) => {
        if (!data) return ""
        if (type === "filter" || type === "sort") return data
        return `<i class="fas fa-key"></i>`
      },
    }
  }
  static meta_localisation() {
    return {
      data: "meta_localisation",
      title: Render.icon("localisation") + "Localisation",
      defaultContent: "",
      tooltip: "Localisation (dans les données ou dans le schéma",
      render: data => {
        if (!data) return ""
        return data
      },
    }
  }
  static inherited() {
    return {
      data: "inherited",
      title: Render.icon("diagram") + "Hérité",
      defaultContent: "",
      tooltip: "Element direct (vide) ou hérité d'un sous-élément (hérité)",
    }
  }
  static lineage_type() {
    return {
      data: "lineage_type",
      title: Render.icon("diagram") + "Relation",
      defaultContent: "",
      filter_type: "select",
      tooltip: "Source (parent) ou dérivé (enfant)",
      render: (data, type) => {
        if (!data) return ""
        if (data === "derived") return "Dérivé"
        if (data === "source") return "Source"
      },
    }
  }
}
