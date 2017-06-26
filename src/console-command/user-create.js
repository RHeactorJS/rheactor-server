import {CreateUserCommand} from '../command/user/create'
import {EmailValue} from '@rheactorjs/value-objects'
import Promise from 'bluebird'
import bcrypt from 'bcrypt'
Promise.promisifyAll(bcrypt)

export const userCreateConsoleCommand = {
  name: 'user-create',
  arguments: '<email> <firstname> <lastname> <author>',
  description: 'creates a new new user',
  action: (backend, email, firstname, lastname, author) => backend
    .repositories.user.getByEmail(new EmailValue(author))
    .then(author => bcrypt
      .genSaltAsync(backend.config.get('bcrypt_rounds'))
      .then(bcrypt.hashAsync.bind(bcrypt, '12345678'))
      .then((hashedPassword) => {
        return backend.emitter.emit(new CreateUserCommand(new EmailValue(email), firstname, lastname, hashedPassword, true, undefined, author))
          .then(
            /**
             * @param {ModelEvent} event
             */
            event => {
              return backend.repositories.user.getById(event.aggregateId)
                .then(user => {
                  console.log('User created', user.name(), user.email.toString())
                  console.log('Password is 12345678')
                })
            })
      })
    )
}
