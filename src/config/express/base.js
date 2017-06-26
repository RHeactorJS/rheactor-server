import bodyParser from 'body-parser'
import cors from 'cors'
import {replace as replaceWithFastURLParser} from 'fast-url-parser'
import {HttpProblemFromException, sendHttpProblem} from '../../api/send-http-problem'
import {String as StringType} from 'tcomb'

/**
 * @param {String} environment
 * @param {String} mimeType
 * @param {express.app} app
 * @returns {{sendHttpProblem: <function>}}
 */
export const rheactorjsExpressBaseConfig = (environment, mimeType, app) => {
  StringType(environment, ['rheactorjsServerExpressBaseConfiguration', 'environment:String'])
  StringType(mimeType, ['rheactorjsServerExpressBaseConfiguration', 'mimeType:String'])

  replaceWithFastURLParser()

  app.enable('trust proxy')
  app.use(bodyParser.json({type: mimeType}))

  app.use(cors({
    origin: true, // Use request origin
    exposedHeaders: [
      'cache-control',
      'connection',
      'content-length',
      'content-type',
      'last-modified',
      'etag',
      'location',
      'x-made-by',
      'x-github',
      'x-app'
    ]
  }))

  // Disable caching by default
  app.set('etag', false)
  app.use((req, res, next) => {
    res.header('Cache-Control', 'max-age=0, private')
    next()
  })

  // Set content type
  const CONTENT_TYPE = mimeType + '; charset=utf-8'
  app.use((req, res, next) => {
    if (/\/api/.test(req.url)) {
      res.header('Content-Type', CONTENT_TYPE)
    }
    next()
  })

  app.use(function (err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }
    if (err.name === 'AuthenticationError') {
      return res
        .status(401)
        .send(HttpProblemFromException(err, 401))
    }
    console.error(err.name)
    console.error(req.method + ' ' + req.url)
    console.error(err.message)
    console.error(err.stack)
    return res.status(500)
      .send(HttpProblemFromException(err, 500))
  })

  return {
    sendHttpProblem: sendHttpProblem.bind(null, environment)
  }
}
