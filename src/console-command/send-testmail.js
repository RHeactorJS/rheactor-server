import TemplateMailerClient from 'template-mailer-aws-lambda-client'
import {emails} from '../services/emails'

export default {
  name: 'send-testmail',
  arguments: '<template> <to> <name>',
  description: 'Send a testmail',
  action: (backend, template, to, name) => {
    let mailerConfig = backend.config.get('template_mailer')
    let webConfig = backend.webConfig
    return emails.load()
      .filter((email) => {
        return email.identifier === template
      })
      .spread((email) => {
        let data = email.defaults
        data.webHost = backend.config.get('web_host')
        data.baseHref = webConfig.baseHref
        return new TemplateMailerClient(mailerConfig['endpoint'], mailerConfig['api_key'])
          .send(mailerConfig['transport'], mailerConfig['template_prefix'] + template, to, name, data)
          .then(() => {
            console.log('Sent', template, 'to', to)
          })
      })
  }
}
