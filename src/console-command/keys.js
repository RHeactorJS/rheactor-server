import keys from '../services/keys'

export default {
  name: 'keys',
  description: 'Print the private and public keys',
  action: ({config, redis}) => {
    return keys(config, redis.client)
      .then(({privateKey, publicKey}) => {
        console.log(privateKey)
        console.log(publicKey)
      })
  }
}
