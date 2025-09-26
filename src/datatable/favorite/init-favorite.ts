import jQuery from 'jquery'
import Favorites from '@favorite/favorites'

export default function initFavorite(tableId, datatable) {
  const jqueryFavorite = jQuery('table#' + tableId + '._datatables')
  jqueryFavorite.on('click', '.icon.favorite', function (this: HTMLElement) {
    const elem = jQuery(this)
    const isFavorite = elem.data('is-favorite')
    const column = elem.data('col')
    const row = elem.data('row')
    const favId = elem.data('id')
    const entity = elem.data('entity')
    const cell = datatable.cell({ row, column })
    if (isFavorite) {
      Favorites.remove(entity, favId)
      cell.data(false)
    } else {
      Favorites.add(entity, favId)
      cell.data(true)
      jQuery(cell.node()).find('.favorite').addClass('clicked')
    }
  })
}
