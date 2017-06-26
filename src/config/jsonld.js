import {User, Status, JsonWebToken, Link} from 'models'
import {JSONLD} from '../api/jsonld'
import {URIValue, URIValueType} from 'value-objects'

/**
 * @param {URIValue} apiHost
 * @returns {JSONLD}
 */
export default function (apiHost) {
  URIValueType(apiHost)
  let apiBase = apiHost.slashless().toString() + '/api'
  const jsonld = new JSONLD()

  jsonld.mapType(User.$context, new URIValue(apiBase + '/user/:id'))

  jsonld.addIndexLink(new Link(new URIValue(apiBase + '/status'), Status.$context, false, 'status'))
  jsonld.addIndexLink(new Link(new URIValue(apiBase + '/login'), JsonWebToken.$context, false, 'login'))
  jsonld.addIndexLink(new Link(new URIValue(apiBase + '/token/create'), JsonWebToken.$context, false, 'create-token'))
  jsonld.addIndexLink(new Link(new URIValue(apiBase + '/registration'), User.$context, false, 'register'))
  jsonld.addIndexLink(new Link(new URIValue(apiBase + '/password-change'), User.$context, false, 'password-change'))
  jsonld.addIndexLink(new Link(new URIValue(apiBase + '/password-change/confirm'), User.$context, false, 'password-change-confirm'))
  jsonld.addIndexLink(new Link(new URIValue(apiBase + '/activate-account'), User.$context, false, 'activate-account'))
  jsonld.addIndexLink(new Link(new URIValue(apiBase + '/user'), User.$context, false, 'create-user'))
  jsonld.addIndexLink(new Link(new URIValue(apiBase + '/search/user'), User.$context, true, 'list-users'))

  jsonld.addLink(JsonWebToken.$context, new Link(new URIValue(apiBase + '/token/verify'), JsonWebToken.$context, false, 'token-verify'))
  jsonld.addLink(JsonWebToken.$context, new Link(new URIValue(apiBase + '/token/renew'), JsonWebToken.$context, false, 'token-renew'))

  jsonld.addLink(User.$context, new Link(new URIValue(apiBase + '/user/:id/email-change'), User.$context, false, 'change-email'))
  jsonld.addLink(User.$context, new Link(new URIValue(apiBase + '/user/:id/email-change/confirm'), User.$context, false, 'change-email-confirm'))
  jsonld.addLink(User.$context, new Link(new URIValue(apiBase + '/user/:id/email'), User.$context, false, 'update-email'))
  jsonld.addLink(User.$context, new Link(new URIValue(apiBase + '/user/:id/active'), User.$context, false, 'update-active'))
  jsonld.addLink(User.$context, new Link(new URIValue(apiBase + '/user/:id/firstname'), User.$context, false, 'update-firstname'))
  jsonld.addLink(User.$context, new Link(new URIValue(apiBase + '/user/:id/lastname'), User.$context, false, 'update-lastname'))
  jsonld.addLink(User.$context, new Link(new URIValue(apiBase + '/user/:id/avatar'), User.$context, false, 'update-avatar'))
  jsonld.addLink(User.$context, new Link(new URIValue(apiBase + '/user/:id/preferences'), User.$context, false, 'update-preferences'))

  return jsonld
}
