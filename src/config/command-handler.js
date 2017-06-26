import {EmittedEventsHandlerRegistry} from '../services/emitted-events-handler-registry'

import UserActivateCommandHandler from '../command-handler/repository/user/activate'
import CreateCommandHandler from '../command-handler/repository/user/create'
import DeactivateCommandHandler from '../command-handler/repository/user/deactivate'
import EmailChangeCommandHandler from '../command-handler/repository/user/email-change'
import GrantSuperuserPermissionsCommandHandler from '../command-handler/repository/user/grant-superuser-permissions'
import PasswordChangeCommandHandler from '../command-handler/repository/user/password-change'
import RevokeSuperuserPermissionsCommandHandler from '../command-handler/repository/user/revoke-superuser-permissions'
import UpdateAvatarCommandHandler from '../command-handler/repository/user/update-avatar'
import UpdatePropertyCommandHandler from '../command-handler/repository/user/update-property'

import UserConfirmEmailHandler from '../command-handler/user-confirm-email-handler'
import UserSendPasswordChangeConfirmationLinkHandler from '../command-handler/user-send-password-change-confirmation-link-handler'
import UserSendEmailChangeConfirmationLinkHandler from '../command-handler/user-send-email-change-confirmation-link-handler'

/**
 * @param {UserRepository} repos
 * @param {BackendEmitter} emitter
 * @param {nconf} config
 * @param {object} webConfig
 * @param {TemplateMailerClient} templateMailerClient
 */
export function rheactorjsCommandHandler (repos, emitter, config, webConfig, templateMailerClient) {
  const c = new EmittedEventsHandlerRegistry(emitter)

  const registerHandler = (handler) => {
    c.addHandler(handler.command, handler.handler.bind(null, repos.user))
  }

  registerHandler(UserActivateCommandHandler)
  registerHandler(CreateCommandHandler)
  registerHandler(DeactivateCommandHandler)
  registerHandler(EmailChangeCommandHandler)
  registerHandler(GrantSuperuserPermissionsCommandHandler)
  registerHandler(PasswordChangeCommandHandler)
  registerHandler(RevokeSuperuserPermissionsCommandHandler)
  registerHandler(UpdateAvatarCommandHandler)
  registerHandler(UpdatePropertyCommandHandler)

  UserConfirmEmailHandler(templateMailerClient, config, webConfig)(c)
  UserSendPasswordChangeConfirmationLinkHandler(templateMailerClient, config, webConfig)(c)
  UserSendEmailChangeConfirmationLinkHandler(templateMailerClient, config, webConfig)(c)
}
