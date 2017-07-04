export class GrantSuperUserPermissionsCommand {
  /**
   * @param {UserModel} user
   * @param {UserModel} author
   */
  constructor (user, author) {
    this.user = user
    this.author = author
  }
}
