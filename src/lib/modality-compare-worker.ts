export function modalityCompareWorker(param) {
  function getSimilitudes(modalitiesToCompare, limit = null) {
    const similitutes = []
    for (const modality1 of modalitiesToCompare) {
      const nbValue = modality1.valuesClean.length
      for (const modality2 of modalitiesToCompare) {
        if (modality1.modalityId === modality2.modalityId) continue
        let nbSimilitude = 0
        for (const value1 of modality1.valuesClean) {
          if (modality2.valuesClean.includes(value1)) nbSimilitude += 1
        }
        const ratio = nbSimilitude / nbValue
        if (ratio > 0.5) {
          similitutes.push({
            modality1Id: modality1.modalityId,
            modality2Id: modality2.modalityId,
            modality1FolderId: modality1.folderId,
            modality2FolderId: modality2.folderId,
            modality1Name: modality1.name,
            modality2Name: modality2.name,
            modality1FolderName: modality1.folderName,
            modality2FolderName: modality2.folderName,
            modality1Type: modality1.type,
            modality2Type: modality2.type,
            modality1NbValue: modality1.valuesClean.length,
            modality2NbValue: modality2.valuesClean.length,
            modality1NbVariable: modality1.nbVariable,
            modality2NbVariable: modality2.nbVariable,
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
      modalityId: modality.id,
      valuesClean,
      name: modality.name,
      type: modality.typeClean,
      nbVariable: modality.variables.length,
      folderId: modality.folderId,
      folderName: modality.folderName,
    })
  }
  const similitutes = getSimilitudes(modalitiesToCompare, limit)
  similitutes.sort((a, b) => b.ratio - a.ratio)
  return similitutes
}
