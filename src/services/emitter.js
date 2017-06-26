import {EventEmitter} from 'events'
import _snakeCase from 'lodash/snakeCase'
import Promise from 'bluebird'
import {ModelEvent} from '@rheactorjs/event-store'

export class BackendEmitter extends EventEmitter {
  toEventName (cmdOrEvent) {
    if (ModelEvent.is(cmdOrEvent)) return _snakeCase(cmdOrEvent.name)
    if (typeof cmdOrEvent === 'object' && cmdOrEvent.constructor) {
      return _snakeCase(cmdOrEvent.constructor.name)
    }
    return _snakeCase(cmdOrEvent.name || cmdOrEvent)
  }

  emit (cmd) {
    if (!cmd) {
      console.error('BackendEmitter.emit called without cmd')
      return
    }
    let event = this.toEventName(cmd)
    if (cmd instanceof Error) {
      event = 'error'
    }
    if (this.isVerbose) {
      console.log('BackendEmitter', event)
    }
    cmd.promise = new Promise((resolve, reject) => {
      cmd.resolve = resolve
      cmd.reject = reject
    })
    super.emit(event, cmd)
    super.emit('*', cmd)
    return cmd.promise
  }

  verbose () {
    this.isVerbose = true
  }
}

export default new BackendEmitter()
