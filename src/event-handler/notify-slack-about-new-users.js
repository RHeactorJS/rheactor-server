import {UserActivatedEvent} from '../event/user'
import request from 'request-promise'
import {SlackNotified} from '../event/slack'

/**
 * Publish a notification to slack about new user activations
 *
 * @param {URIValue} webhookURI
 * @param {String} appName
 * @param {UserRepository} userRepo
 */
export default (webhookURI, appName, userRepo) => {
  /**
   * {EmittedEventsHandlerRegistry} c
   */
  return c => {
    c.addHandler(UserActivatedEvent,
      /**
       * @param {UserActivatedEvent} event
       */
      event => userRepo.getById(event.aggregateId)
        .then(
          user => request(
            {
              method: 'POST',
              uri: webhookURI.toString(),
              body: {
                username: appName,
                text: ':rocket: ' + user.name + ' ' + user.email.toString() + ' just confirmed their account!'
              },
              json: true,
              transform: () => {
                // Response is: 'ok'
                return new SlackNotified(event)
              }
            })
            .catch((err) => {
              console.error('Slack webhook failed', err)
            })
        )
    )
  }
}
