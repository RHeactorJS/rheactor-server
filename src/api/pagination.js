import {Link, List} from 'models'
import url from 'fast-url-parser'
import Promise from 'bluebird'
import {URIValue, URIValueType} from 'value-objects'
import {PaginatedResultType} from '../model/paginated-result'
import {Object as ObjectType, Function as FunctionType} from 'tcomb'

/**
 * @param {PaginatedResult} result
 * @param {URIValue} urlTemplate
 * @return {Array.<Link>}
 */
export const createPaginationLinks = (result, urlTemplate) => {
  PaginatedResultType(result)
  URIValueType(urlTemplate)
  let links = []
  links.push(new Link(
    new URIValue(urlTemplate.toString().replace(':offset', result.offset)),
    List.$context,
    true,
    'self'
  ))
  if (result.nextOffset !== undefined) {
    links.push(new Link(
      new URIValue(urlTemplate.toString().replace(':offset', result.nextOffset)),
      List.$context,
      true,
      'next'
    ))
  }
  if (result.prevOffset !== undefined) {
    links.push(new Link(
      new URIValue(urlTemplate.toString().replace(':offset', result.prevOffset)),
      List.$context,
      true,
      'prev'
    ))
  }
  return links
}

/**
 * @param {URIValue} apiHost
 * @param {Object} req
 * @param {Object} res
 * @param {function} itemTransformer
 * @param {PaginatedResult} result
 * @returns {Promise}
 */
export const sendPaginatedListResponse = (apiHost, req, res, itemTransformer, result) => {
  URIValueType(apiHost)
  ObjectType(req)
  ObjectType(res)
  FunctionType(itemTransformer)
  PaginatedResultType(result)
  return Promise
    .map(result.items, itemTransformer)
    .then((models) => {
      let parsedReqUrl = url.parse(req.url, true)
      delete parsedReqUrl.search
      parsedReqUrl._query = Object.assign(parsedReqUrl._query, result.query, {offset: ':offset'})
      let searchUrl = apiHost.slashless().toString() + url.format(parsedReqUrl).replace('%3Aoffset', ':offset')
      searchUrl = searchUrl.replace(/&$/, '')
      const list = new List(
        models,
        result.total,
        result.itemsPerPage,
        createPaginationLinks(result, new URIValue(searchUrl)),
        result.offset
      )
      return res.send(list)
    })
}
