import {User} from 'models'
import {JSONLDType} from './jsonld'
import {AggregateRootType} from 'event-store'
import {UserModelType} from '../model/user'

/**
 * @param {JSONLD} jsonld
 * @param {AggregateRoot} model
 */
export function transform (jsonld, model) {
  JSONLDType(jsonld)
  AggregateRootType(model)
  switch (model.constructor.name) {
    case 'UserModel':
      return userTransformer(model, jsonld)
  }
}

export const userTransformer = (user, jsonld) => {
  UserModelType(user)
  JSONLDType(jsonld)
  return new User({
    $id: jsonld.createId(User.$context, user.aggregateId()),
    $version: user.aggregateVersion(),
    $links: jsonld.createLinks(User.$context, user.aggregateId()),
    $createdAt: user.createdAt(),
    $updatedAt: user.updatedAt(),
    $deletedAt: user.deletedAt(),
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    avatar: user.avatar ? user.avatar : undefined,
    superUser: user.superUser,
    active: user.isActive,
    preferences: user.preferences
  })
}
