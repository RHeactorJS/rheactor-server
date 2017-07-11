import keys from '../services/keys'
import { verify } from '../util/tokens'
import { URIValue } from '@rheactorjs/value-objects'

export default {
  name: 'verify-token',
  arguments: '<token>',
  description: 'Verify a token',
  action: ({config, redis}, token) => {
    return keys(config, redis.client)
      .then(({publicKey}) => verify(new URIValue(config.get('api_host')), publicKey, token))
      .then(token => {
        console.log(token)
      })
  }
}
