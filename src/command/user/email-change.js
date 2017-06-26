import {UserModelType} from '../../model/user'
import {EmailValueType} from 'value-objects'

/**
 * @param {UserModel} user
 * @param {EmailValue} email
 * @param {UserModel} author
 * @constructor
 */
export default function ChangeUserEmailCommand (user, email, author) {
  UserModelType(user)
  EmailValueType(email)
  UserModelType(author)
  this.user = user
  this.email = email
  this.author = author
}
