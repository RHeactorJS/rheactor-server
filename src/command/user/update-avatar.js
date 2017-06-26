import {UserModelType} from '../../model/user'
import {URIValueType} from 'value-objects'

/**
 * @param {UserModel} user
 * @param {URIValue} avatar
 * @param {UserModel} author
 * @constructor
 */
function UpdateUserAvatarCommand (user, avatar, author) {
  UserModelType(user)
  URIValueType(avatar)
  UserModelType(author)
  this.user = user
  this.avatar = avatar
  this.author = author
}

export default UpdateUserAvatarCommand
