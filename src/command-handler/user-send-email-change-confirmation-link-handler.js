import SendUserEmailChangeConfirmationLinkCommand from '../command/user/send-email-change-confirmation-link'
import {UserEmailChangeConfirmationLinkSentEvent} from '../event/user'
import {changeEmailToken} from '../util/tokens'
import {URIValue} from '@rheactorjs/value-objects'

/**
 * Send a email reset token if requested
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
    c.addHandler(SendUserEmailChangeConfirmationLinkCommand,
      /**
       * @param {SendUserEmailChangeConfirmationLinkCommand} cmd
       */
      (cmd) => {
        let mailerConfig = config.get('template_mailer')
        return changeEmailToken(new URIValue(config.get('api_host')), config.get('private_key'), config.get('token_lifetime'), cmd.user, {email: cmd.email.toString()})
          .then((token) => {
            return templateMailerClient
              .send(mailerConfig['transport'], mailerConfig['template_prefix'] + mailerConfig['email_change_template'], cmd.email.toString(), cmd.user.name(), {
                recipient: {
                  firstname: cmd.user.firstname,
                  lastname: cmd.user.lastname
                },
                link: (new URIValue(config.get('web_host') + webConfig.baseHref).slashless()) + '/account/email-change/' + token.token,
                baseHref: webConfig.baseHref,
                webHost: config.get('web_host')
              })
              .then(() => {
                return new UserEmailChangeConfirmationLinkSentEvent(cmd.user, cmd.email, token)
              })
          })
      })
  }
}
