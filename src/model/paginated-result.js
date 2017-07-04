import {irreducible, list, maybe, Object as ObjectType} from 'tcomb'
import {PositiveIntegerType, ZeroOrPositiveIntegerType, MaybeZeroOrPositiveIntegerType} from '../util/pagination'
const ItemListType = list(ObjectType)
const MaybeObjectType = maybe(ObjectType)

export class PaginatedResult {
  /**
   * Represents a paginated result
   *
   * @param {Array} items The actual items on the current page
   * @param {Number} total The total number of items
   * @param {Number} itemsPerPage The number of items per page
   * @param {Number} offset The offset of the current page
   * @param {object} query The query object used for the result
   * @param {Number|undefined} prevOffset If set represents the offset to use in order to fetch the previous page
   * @param {Number|undefined} nextOffset If set represents the offset to use in order to fetch the next page
   * @constructor
   */
  constructor (items, total, itemsPerPage, offset, query, prevOffset, nextOffset) {
    ItemListType(items)
    ZeroOrPositiveIntegerType(total)
    PositiveIntegerType(itemsPerPage)
    ZeroOrPositiveIntegerType(offset)
    MaybeObjectType(query)
    MaybeZeroOrPositiveIntegerType(prevOffset)
    MaybeZeroOrPositiveIntegerType(nextOffset)
    Object.defineProperty(this, 'items', {value: items, enumerable: true})
    Object.defineProperty(this, 'total', {value: total, enumerable: true})
    Object.defineProperty(this, 'itemsPerPage', {value: itemsPerPage, enumerable: true})
    Object.defineProperty(this, 'offset', {value: offset, enumerable: true})
    Object.defineProperty(this, 'query', {value: query, enumerable: true})
    Object.defineProperty(this, 'prevOffset', {value: prevOffset, enumerable: true})
    Object.defineProperty(this, 'nextOffset', {value: nextOffset, enumerable: true})
  }
}

export const PaginatedResultType = irreducible('PaginatedResultType', x => x instanceof PaginatedResult)
