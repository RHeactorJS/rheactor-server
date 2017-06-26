import configureMailerConsoleCommand from './configure-mailer'
import sendEmailConfirmationConsoleCommand from './send-email-confirmation-mail'
import sendLostPasswordMailConsoleCommand from './send-lost-password-mail'
import sendTestMailConsoleCommand from './send-testmail'
import userUpdateConsoleCommand from './user-update'
import usersConsoleCommand from './users'
import {userCreateConsoleCommand} from './user-create'

export const rheactorjsConsoleCommands = [
  configureMailerConsoleCommand,
  sendEmailConfirmationConsoleCommand,
  sendLostPasswordMailConsoleCommand,
  sendTestMailConsoleCommand,
  userCreateConsoleCommand,
  userUpdateConsoleCommand,
  usersConsoleCommand
]
