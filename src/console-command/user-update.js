import UpdateUserAvatarCommand from '../command/user/update-avatar'
import ChangeUserEmailCommand from '../command/user/email-change'
import DeactivateUserCommand from '../command/user/deactivate'
import ActivateUserCommand from '../command/user/activate'
import {GrantSuperUserPermissionsCommand} from '../command/user/grant-superuser-permissions'
import RevokeSuperUserPermissionCommand from '../command/user/revoke-superuser-permissions'
import {URIValue, EmailValue} from '@rheactorjs/value-objects'
import Promise from 'bluebird'

export default {
  name: 'user-update',
  arguments: '<email> <author>',
  description: 'Update user properties',
  options: [
    ['-a, --avatar <url>', 'Set the avatar'],
    ['-e, --email <email>', 'Set the email'],
    ['-d, --deactivate', 'Deactivate the user'],
    ['-A, --activate', 'Activate the user'],
    ['-s, --superuser', 'Grant superUser permissions'],
    ['-n, --nosuperuser', 'Remove superUser permissions']
  ],
  action: (backend, email, author, options) => Promise
    .join(
      backend.repositories.user.getByEmail(new EmailValue(email)),
      backend.repositories.user.getByEmail(new EmailValue(author))
    )
    .spread((user, author) => {
      const p = []
      if (options.avatar) {
        p.push(backend.emitter.emit(new UpdateUserAvatarCommand(user, new URIValue(options.avatar), author)))
      }
      if (options.email) {
        p.push(backend.emitter.emit(new ChangeUserEmailCommand(user, new EmailValue(options.email), author)))
      }
      if (options.deactivate) {
        p.push(backend.emitter.emit(new DeactivateUserCommand(user, author)))
      }
      if (options.activate) {
        p.push(backend.emitter.emit(new ActivateUserCommand(user, author)))
      }
      if (options.superuser) {
        p.push(backend.emitter.emit(new GrantSuperUserPermissionsCommand(user, author)))
      }
      if (options.nosuperuser) {
        p.push(backend.emitter.emit(new RevokeSuperUserPermissionCommand(user, author)))
      }
      return Promise.all(p)
    })
}
