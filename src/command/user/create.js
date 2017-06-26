import {MaybeUserModelType} from '../../model/user'
import {Boolean as BooleanType, String as StringType} from 'tcomb'
import {EmailValueType} from '@rheactorjs/value-objects'

export class CreateUserCommand {
  /**
   * @param {EmailValue} email
   * @param {String} firstname
   * @param {String} lastname
   * @param {String} password
   * @param {Boolean} active
   * @param {URIValue} avatar
   * @param {UserModel} author
   */
  constructor (email, firstname, lastname, password, active = false, avatar, author = undefined) {
    EmailValueType(email)
    StringType(firstname)
    StringType(lastname)
    StringType(password)
    BooleanType(active)
    MaybeUserModelType(author)
    this.email = email
    this.firstname = firstname
    this.lastname = lastname
    this.password = password
    this.active = active
    this.avatar = avatar
    this.author = author
  }
}
