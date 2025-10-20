import jQuery from 'jquery'
import 'jquery-powertip'
import { addValuesToAttribut } from '@stat/stat'
import definition from '@stat/attributs-def'
import type { Row } from '@type'
import type { AttributWithValues } from '@stat/stat'
import type { MainEntityName } from '@src/type'

let currentData: Row[] = []

export function setCurrentTabData(data: Row[]) {
  currentData = data
}

export function initTooltips() {
  jQuery('body').on('mouseover', '.use-tooltip', function (this: HTMLElement) {
    const elem = jQuery(this)
    if (!elem?.data('powertip-initialized')) {
      elem?.data('powertip-initialized', true)
      // @ts-expect-error - powerTip is a jQuery plugin
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      elem?.powerTip({
        placement: elem.hasClass('tooltip-top') ? 'n' : 's',
        smartPlacement: true,
        mouseOnToPopup: true,
      })
      // @ts-expect-error - powerTip is a jQuery plugin
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      elem?.powerTip('show')
    }
  })
}

export function initColumnStatBtn(
  onOpen: (
    entity: MainEntityName | 'log',
    attribut: AttributWithValues,
  ) => void,
) {
  jQuery('body').on('click', '.column-stat-btn', function (this: HTMLElement) {
    const attributName = jQuery(this).data('attribut') as string
    const entity = jQuery(this).data('entity') as MainEntityName | 'log'
    const attribut = addValuesToAttribut(currentData, {
      key: attributName,
      ...definition[attributName],
    })
    if (attribut) onOpen(entity, attribut)
  })
}
