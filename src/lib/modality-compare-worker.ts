import type { Modality } from '@type'
type ModalityToCompare = {
  modalityId: string | number
  valuesClean: unknown[]
  name: string
  type: string
  nbVariable: number
  folderId: string | number
  folderName: string
}

export function modalityCompareWorker(param: {
  modalitiesCompare: Modality[]
  limit: number | null
}) {
  function getSimilitudes(
    modalitiesToCompare: ModalityToCompare[],
    limit: number | null = null,
  ) {
    const similitutes: { [key: string]: unknown; ratio: number }[] = []
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
  const modalitiesToCompare: ModalityToCompare[] = []
  for (const modality of param.modalitiesCompare) {
    if (!modality.values) continue
    const valuesClean: unknown[] = []
    for (let i = 0; i < modality.values.length; i++) {
      const value = modality.values[i]
      if (value.value === null || value.value === undefined) continue
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
      type: modality.typeClean ?? '',
      nbVariable: modality.variables?.length ?? 0,
      folderId: modality.folderId ?? '',
      folderName: '',
    })
  }
  const similitutes = getSimilitudes(modalitiesToCompare, limit)
  similitutes.sort((a, b) => b.ratio - a.ratio)
  return similitutes
}
