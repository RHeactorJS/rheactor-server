import {User, JSONLDType} from '@rheactorjs/models'
import {ImmutableAggregateRootType} from '@rheactorjs/event-store'
import {UserModelType} from '../model/user'

/**
 * @param {JSONLD} jsonld
 * @param {AggregateRoot} model
 */
export function transform (jsonld, model) {
  JSONLDType(jsonld)
  ImmutableAggregateRootType(model)
  switch (model.constructor.name) {
    case 'UserModel':
      return userTransformer(model, jsonld)
  }
}

export const userTransformer = (user, jsonld) => {
  UserModelType(user)
  JSONLDType(jsonld)
  return new User({
    $id: jsonld.createId(User.$context, user.meta.id),
    $version: user.meta.version,
    $links: jsonld.createLinks(User.$context, user.meta.id),
    $createdAt: user.meta.createdAt,
    $updatedAt: user.meta.updatedAt,
    $deletedAt: user.meta.deletedAt,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    avatar: user.avatar ? user.avatar : undefined,
    superUser: user.superUser,
    active: user.isActive,
    preferences: user.preferences
  })
}
