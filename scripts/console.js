import program from 'commander'
import Promise from 'bluebird'
import {red} from 'colors'
import {kebabCase} from 'lodash'
import backend from '../test/backend'
import {rheactorjsConsoleCommands} from '../src/console-command/rheactorjs-console-commands'
const config = backend.config

program
  .version(config.get('version'))

let resolveTimeout
const emitterActive = new Promise((resolve, reject) => {
  resolveTimeout = resolve
})

let backendEmitterTimout
backend.emitter.on('*', () => {
  clearTimeout(backendEmitterTimout)
  backendEmitterTimout = setTimeout(() => {
    resolveTimeout()
  }, 1000)
})
backendEmitterTimout = setTimeout(() => {
  resolveTimeout()
}, 2000)

const runCommand = function (cmd) {
  cmd.action.apply(null, [backend, ...[].slice.call(arguments, 1)])
    .then(() => {
      emitterActive
        .then(() => {
          process.exit(0)
        })
    })
    .catch((err) => {
      console.error(red(err.message))
      process.exit(1)
    })
}

const configureCommand = (cmd) => {
  const cmdName = kebabCase(cmd.name)
  const c = program
    .command([cmdName, cmd.arguments].join(' '))
    .description(cmd.description)
    .action(runCommand.bind(null, cmd))
  if (cmd.options) {
    cmd.options.map(option => {
      c.option(...option)
    })
  }
  return cmdName
}

Promise.join(
  rheactorjsConsoleCommands.map(configureCommand)
)
  .spread(commands => {
    if (!process.argv.slice(2).length || !commands.includes(process.argv.slice(2)[0])) {
      red(backend.appName)
      program.outputHelp(red)
      process.exit(1)
    } else {
      program.parse(process.argv)
    }
  })
