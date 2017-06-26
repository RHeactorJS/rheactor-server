import ChangeUserEmailCommand from '../../../command/user/email-change'
import {ConflictError} from '@rheactorjs/errors'

export default {
  command: ChangeUserEmailCommand,
  /**
   * @param {UserRepository} repository
   * @param {ChangeUserEmailCommand} cmd
   * @return {ModelEvent}
   */
  handler: (repository, cmd) => repository.findByEmail(cmd.email)
    .then(existingUser => {
      if (existingUser) throw new ConflictError('Email address already in use: ' + cmd.email.toString())
      return repository.persistEvent(cmd.user.setEmail(cmd.email, cmd.author))
    })
}
