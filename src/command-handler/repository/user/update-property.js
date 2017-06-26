import UpdateUserPropertyCommand from '../../../command/user/update-property'
import {ApplicationError} from '@rheactorjs/errors'

export default {
  command: UpdateUserPropertyCommand,
  /**
   * @param {UserRepository} repository
   * @param {UpdateUserPropertyCommand} cmd
   * @return {ModelEvent}
   */
  handler: (repository, cmd) => {
    switch (cmd.property) {
      case 'firstname':
        return repository.persistEvent(cmd.user.setFirstname(cmd.value, cmd.author))
      case 'lastname':
        return repository.persistEvent(cmd.user.setLastname(cmd.value, cmd.author))
      case 'preferences':
        return repository.persistEvent(cmd.user.setPreferences(cmd.value, cmd.author))
      default:
        throw new ApplicationError('Changing of "' + cmd.property + '" on users not supported!')
    }
  }
}
