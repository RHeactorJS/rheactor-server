import keys from '../services/keys'

export default {
  name: 'keys',
  description: 'Print the private and public keys',
  options: [
    ['-P, --private', 'Print the private key']
  ],
  action: ({config, redis}, options) => {
    return keys(config, redis.client)
      .then(({privateKey, publicKey}) => {
        console.log(publicKey)
        if (options.private) console.log(privateKey)
      })
  }
}
