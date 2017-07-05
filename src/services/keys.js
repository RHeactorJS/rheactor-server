import Promise from 'bluebird'
import keypair from 'keypair'

export default function (config, redis) {
  const environment = config.get('environment')
// Generate RSA keys for JWT
  return Promise
    .join(
      redis.getAsync(environment + ':id_rsa'),
      redis.getAsync(environment + ':id_rsa.pub')
    )
    .spread((privateKey, publicKey) => {
      if (privateKey && publicKey) {
        config.set('private_key', privateKey)
        config.set('public_key', publicKey)
        if (environment === 'production') {
          console.log('RSA key pair loaded')
          console.log(config.get('public_key'))
        }
        return Promise.resolve({privateKey, publicKey})
      } else {
        let pair = keypair({bits: 1024})
        config.set('private_key', pair.private)
        config.set('public_key', pair.public)
        if (environment === 'production') {
          console.log('RSA key pair generated')
          console.log(config.get('public_key'))
        }
        return Promise
          .join(
            redis.setAsync(environment + ':id_rsa', pair.private),
            redis.setAsync(environment + ':id_rsa.pub', pair.public)
          )
          .then(() => ({privateKey: pair.private, publicKey: pair.public}))
      }
    })
}
