import jQuery from 'jquery'
import Favorites from '@favorite/favorites'

export default function initFavorite(table_id, datatable) {
  const jquery_favorite = jQuery('table#' + table_id + '._datatables')
  jquery_favorite.on('click', '.icon.favorite', function (this: HTMLElement) {
    const elem = jQuery(this)
    const is_favorite = elem.data('is_favorite')
    const column = elem.data('col')
    const row = elem.data('row')
    const fav_id = elem.data('id')
    const entity = elem.data('entity')
    const cell = datatable.cell({ row, column })
    if (is_favorite) {
      Favorites.remove(entity, fav_id)
      cell.data(false)
    } else {
      Favorites.add(entity, fav_id)
      cell.data(true)
      jQuery(cell.node()).find('.favorite').addClass('clicked')
    }
  })
}
