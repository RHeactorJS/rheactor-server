import {ConflictError} from '@rheactorjs/errors'
import {ImmutableAggregateRootType} from '@rheactorjs/event-store'
import {PositiveIntegerType} from '../util/pagination'

/**
 * @param {Number} theirVersion
 * @param {ImmutableAggregateRoot} model
 * @throws {ConflictError}
 */
export const checkVersionImmutable = (theirVersion, model) => {
  theirVersion = PositiveIntegerType(+theirVersion, ['checkVersionImmutable()', 'theirVersion:Integer > 0'])
  let ourVersion = ImmutableAggregateRootType(model).meta.version
  if (theirVersion !== ourVersion) {
    throw new ConflictError(model.constructor.name + ' "' + model.meta.id + '" has been modified. ' +
      'Your version is ' + theirVersion +
      ' our version is ' + ourVersion
    )
  }
}
