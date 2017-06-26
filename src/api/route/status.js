import {Status} from '@rheactorjs/models'

export default function (app, config) {
  app.get('/api/status', function (req, res) {
    res
      .status(200)
      .send(new Status('ok', new Date(), config.get('version') + '+' + config.get('environment') + '.' + config.get('deploy_time')))
  })
}
