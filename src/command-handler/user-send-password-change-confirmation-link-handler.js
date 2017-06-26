import SendUserPasswordChangeConfirmationLinkCommand from '../command/user/send-password-change-confirmation-link'
import {UserPasswordChangeConfirmationLinkSentEvent} from '../event/user'
import {lostPasswordToken} from '../util/tokens'
import {URIValue} from '@rheactorjs/value-objects'

/**
 * Send a password reset token if requested
 *
 * @param {TemplateMailerClient} templateMailerClient
 * @param {Object} config
 * @param {Object} webConfig
 */
export default (templateMailerClient, config, webConfig) => {
  /**
   * {EmittedEventsHandlerRegistry} c
   */
  return (c) => {
    c.addHandler(SendUserPasswordChangeConfirmationLinkCommand,
      /**
       * @param {SendUserPasswordChangeConfirmationLinkCommand} cmd
       */
      (cmd) => {
        let mailerConfig = config.get('template_mailer')
        return lostPasswordToken(new URIValue(config.get('api_host')), config.get('private_key'), config.get('token_lifetime'), cmd.user)
          .then((token) => {
            return templateMailerClient
              .send(mailerConfig['transport'], mailerConfig['template_prefix'] + mailerConfig['password_change_template'], cmd.user.email.toString(), cmd.user.name(), {
                recipient: {
                  firstname: cmd.user.firstname,
                  lastname: cmd.user.lastname
                },
                link: config.get('web_host') + webConfig.baseHref + '#!/password-change/' + token.token,
                baseHref: webConfig.baseHref,
                webHost: config.get('web_host')
              })
              .then(() => {
                return new UserPasswordChangeConfirmationLinkSentEvent(cmd.user, token)
              })
          })
      })
  }
}
