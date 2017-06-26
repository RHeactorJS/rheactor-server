import {EmittedEventsHandlerRegistry} from '../services/emitted-events-handler-registry'
import {URIValue} from 'value-objects'
import SendEmailConfirmationEventHandler from '../event-handler/send-email-confirmation'
import NotifySlackAboutNewUsersEventHandler from '../event-handler/notify-slack-about-new-users'

/**
 * @param {Array.<AggregateRepository>} repos
 * @param {BackendEmitter} emitter
 * @param {nconf} config
 */
export function rheactorEventHandler (repos, emitter, config) {
  let c = new EmittedEventsHandlerRegistry(emitter)
  SendEmailConfirmationEventHandler(repos.user)(c)
  let slackWebhook = config.get('slack:webhook')
  if (slackWebhook && config.get('environment') !== 'testing') {
    NotifySlackAboutNewUsersEventHandler(new URIValue(slackWebhook), config.get('app'), repos.user)(c)
  }
}
