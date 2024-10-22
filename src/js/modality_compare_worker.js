export function modality_compare_worker(param) {

  function get_similitudes(modalities_to_compare, limit = false) {
    const similitutes = []
    for (const modality_1 of modalities_to_compare) {
      const nb_value = modality_1.values_clean.length
      for (const modality_2 of modalities_to_compare) {
        if (modality_1.modality_id === modality_2.modality_id) continue
        let nb_similitude = 0
        for (const value_1 of modality_1.values_clean) {
          if (modality_2.values_clean.includes(value_1)) nb_similitude += 1
        }
        const ratio = nb_similitude / nb_value
        if (ratio > 0.5) {
          similitutes.push({
            modality_1_id: modality_1.modality_id,
            modality_2_id: modality_2.modality_id,
            modality_1_folder_id: modality_1.folder_id,
            modality_2_folder_id: modality_2.folder_id,
            modality_1_name: modality_1.name,
            modality_2_name: modality_2.name,
            modality_1_folder_name: modality_1.folder_name,
            modality_2_folder_name: modality_2.folder_name,
            modality_1_type: modality_1.type,
            modality_2_type: modality_2.type,
            modality_1_nb_value: modality_1.values_clean.length,
            modality_2_nb_value: modality_2.values_clean.length,
            modality_1_nb_variable: modality_1.nb_variable,
            modality_2_nb_variable: modality_2.nb_variable,
            ratio: Math.round(ratio * 100),
          })
          if (limit && similitutes.length >= limit) return similitutes
        }
      }
    }
    return similitutes
  }

  const limit = param.limit
  const modalities_to_compare = []
  for (const modality of param.modalities_compare) {
    const values_clean = []
    for (let i = 0; i < modality.values.length; i++) {
      const value = modality.values[i]
      let value_clean = value.value.toString().toLowerCase()
      if (value.description !== null && value.description !== undefined) {
        value_clean += "___" + value.description.toString().toLowerCase()
      }
      values_clean.push(value_clean)
    }
    modalities_to_compare.push({
      modality_id: modality.id,
      values_clean,
      name: modality.name,
      type: modality.type_clean,
      nb_variable: modality.variables.length,
      folder_id: modality.folder_id,
      folder_name: modality.folder_name,
    })
  }
  const similitutes = get_similitudes(modalities_to_compare, limit)
  similitutes.sort((a, b) => b.ratio - a.ratio)
  return similitutes
}
