/* global describe, it */

import {expect} from 'chai'
import {checkVersionImmutable} from '../../../src/api/check-version'
import {ImmutableAggregateRoot, AggregateMeta} from '@rheactorjs/event-store'
import {ConflictError} from '@rheactorjs/errors'

describe('checkVersionImmutable', () => {
  it('should throw an ConflictError if version is lower then model version', () => {
    expect(() => checkVersionImmutable(1, new ImmutableAggregateRoot(new AggregateMeta(42, 2)))).to.throw(ConflictError)
  })
  it('should throw an ConflictError if version higher then model version', () => {
    expect(() => checkVersionImmutable(3, new ImmutableAggregateRoot(new AggregateMeta(42, 2)))).to.throw(ConflictError)
  })
  it('should return nothing if version matches', () => {
    expect(checkVersionImmutable(2, new ImmutableAggregateRoot(new AggregateMeta(42, 2)))).to.equal(undefined)
  })
})
