import Promise from 'bluebird'
import TemplateMailerClient from 'template-mailer-aws-lambda-client'
import {emails} from '../services/emails'

export default {
  name: 'configure-mailer',
  description: 'Configure the template mailer',
  action: (backend) => {
    let mailerConfig = backend.config.get('template_mailer')
    let mailer = new TemplateMailerClient(mailerConfig.endpoint, mailerConfig.api_key)
    return Promise.join(
      mailer.config(mailerConfig['transport'], mailerConfig.from, mailerConfig.name)
        .then(() => {
          console.log('Updated transport configuration:', mailerConfig['transport'])
        }),
      emails.load()
        .map((email) => {
          return mailer.template(mailerConfig['template_prefix'] + email.identifier, email.subject, email.html, email.text)
            .then(function () {
              console.log('Updated template mailer template:', email.identifier)
            })
        })
    )
  }
}
