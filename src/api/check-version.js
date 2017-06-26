import {ValidationFailedError, ConflictError} from '@rheactorjs/errors'
import {AggregateRootType, ImmutableAggregateRootType} from 'event-store'
import {PositiveIntegerType} from '../util/pagination'

/**
 * @param {Number} theirVersion
 * @param {AggregateRoot} model
 * @throws {ConflictError}
 * @deprecated Use checkVersionImmutable with ImmutableAggregateRoot
 */
export function checkVersion (theirVersion, model) {
  theirVersion = +theirVersion
  if (theirVersion <= 0) throw new ValidationFailedError('No version provided.')
  PositiveIntegerType(theirVersion, ['checkVersion()', 'theirVersion:Integer > 0'])
  AggregateRootType(model, ['checkVersion()', 'model:AggregateRoot'])
  let ourVersion = model.aggregateVersion()
  if (theirVersion !== ourVersion) {
    throw new ConflictError(model.constructor.name + ' "' + model.aggregateId() + '" has been modified. ' +
      'Your version is ' + theirVersion +
      ' our version is ' + ourVersion
    )
  }
}

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
