import {CreateUserCommand} from '../../../command/user/create'

export default {
  command: CreateUserCommand,
  /**
   * @param {UserRepository} repository
   * @param {CreateUserCommand} cmd
   * @return {UserCreatedEvent}
   */
  handler: (repository, cmd) => repository.add({...cmd, isActive: cmd.active}, cmd.author)
}
