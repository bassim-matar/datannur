export function modalityCompareWorker(param) {
  function getSimilitudes(modalitiesToCompare, limit = null) {
    const similitutes = []
    for (const modality1 of modalitiesToCompare) {
      const nbValue = modality1.values_clean.length
      for (const modality2 of modalitiesToCompare) {
        if (modality1.modality_id === modality2.modality_id) continue
        let nbSimilitude = 0
        for (const value1 of modality1.values_clean) {
          if (modality2.values_clean.includes(value1)) nbSimilitude += 1
        }
        const ratio = nbSimilitude / nbValue
        if (ratio > 0.5) {
          similitutes.push({
            modality_1_id: modality1.modality_id,
            modality_2_id: modality2.modality_id,
            modality_1_folder_id: modality1.folder_id,
            modality_2_folder_id: modality2.folder_id,
            modality_1_name: modality1.name,
            modality_2_name: modality2.name,
            modality_1_folder_name: modality1.folder_name,
            modality_2_folder_name: modality2.folder_name,
            modality_1_type: modality1.type,
            modality_2_type: modality2.type,
            modality_1_nb_value: modality1.values_clean.length,
            modality_2_nb_value: modality2.values_clean.length,
            modality_1_nb_variable: modality1.nb_variable,
            modality_2_nb_variable: modality2.nb_variable,
            ratio: Math.round(ratio * 100),
          })
          if (limit && similitutes.length >= limit) return similitutes
        }
      }
    }
    return similitutes
  }

  const limit = param.limit
  const modalitiesToCompare = []
  for (const modality of param.modalitiesCompare) {
    const valuesClean = []
    for (let i = 0; i < modality.values.length; i++) {
      const value = modality.values[i]
      let valueClean = value.value.toString().toLowerCase()
      if (value.description !== null && value.description !== undefined) {
        valueClean += '___' + value.description.toString().toLowerCase()
      }
      valuesClean.push(valueClean)
    }
    modalitiesToCompare.push({
      modality_id: modality.id,
      values_clean: valuesClean,
      name: modality.name,
      type: modality.type_clean,
      nb_variable: modality.variables.length,
      folder_id: modality.folder_id,
      folder_name: modality.folder_name,
    })
  }
  const similitutes = getSimilitudes(modalitiesToCompare, limit)
  similitutes.sort((a, b) => b.ratio - a.ratio)
  return similitutes
}
