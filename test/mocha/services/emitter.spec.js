/* global describe, it */

import {BackendEmitter} from '../../../src/services/emitter'
import {expect} from 'chai'
import {ModelEvent} from 'event-store'

describe('BackendEmitter', () => {
  it('should emit ModelEvents with their names', done => {
    const event = new ModelEvent('17', 'SomeString')
    const emitter = new BackendEmitter()
    emitter.on('some_string', ev => {
      expect(ev).to.equal(event)
      done()
    })
    emitter.emit(event)
  })
})
