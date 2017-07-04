import {PaginatedResult} from '../model/paginated-result'
import {refinement, Integer as IntegerType, list, Object as ObjectType, maybe, irreducible} from 'tcomb'
const ItemListType = list(ObjectType)
const MaybeObjectType = maybe(ObjectType)

export const PositiveIntegerType = refinement(IntegerType, n => n > 0, 'PositiveIntegerType')
export const ZeroOrPositiveIntegerType = refinement(IntegerType, n => n >= 0, 'ZeroOrPositiveIntegerType')
export const MaybeZeroOrPositiveIntegerType = maybe(ZeroOrPositiveIntegerType)

const maxItemsPerPage = 100

export class Pagination {
  /**
   * @param {Number} offset
   * @param {Number} itemsPerPage
   * @constructor
   */
  constructor (offset, itemsPerPage) {
    offset = Math.max(0, ~~offset || 0)
    itemsPerPage = Math.min(Math.max(1, ~~itemsPerPage || 10), maxItemsPerPage)
    Object.defineProperty(this, 'offset', {value: offset, enumerable: true})
    Object.defineProperty(this, 'itemsPerPage', {value: itemsPerPage, enumerable: true})
  }

  /**
   * splice the array based on the given pagination
   * Useful for selecting a page from a full list of ids
   *
   * @param {Array} list
   * @return {Array}
   */
  splice (list) {
    let self = this
    return list.splice(self.offset, self.itemsPerPage)
  }

  /**
   * Create a result based on this pagination
   *
   * @param {Array} items
   * @param {Number} total
   * @param {object} query The query object used for the result
   * @return PaginatedResult
   */
  result (items, total, query) {
    ItemListType(items)
    ZeroOrPositiveIntegerType(total)
    MaybeObjectType(query)
    let self = this
    let prevOffset
    let nextOffset
    if (self.offset > 0) {
      prevOffset = self.offset - self.itemsPerPage
    }
    if (items.length === self.itemsPerPage && self.offset + self.itemsPerPage < total) {
      nextOffset = self.offset + self.itemsPerPage
    }
    return new PaginatedResult(items, total, self.itemsPerPage, self.offset, query, prevOffset, nextOffset)
  }
}

export const PaginationType = irreducible('PaginationType', x => x instanceof Pagination)
