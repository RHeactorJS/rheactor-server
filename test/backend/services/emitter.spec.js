/* global describe expect, it */

import {BackendEmitter} from '../../../src/services/emitter'

import {ModelEvent} from '@rheactorjs/event-store'

describe('BackendEmitter', () => {
  it('should emit ModelEvents with their names', done => {
    const event = new ModelEvent('17', 'SomeString')
    const emitter = new BackendEmitter()
    emitter.on('some_string', ev => {
      expect(ev).toEqual(event)
      done()
    })
    emitter.emit(event)
  })
})
