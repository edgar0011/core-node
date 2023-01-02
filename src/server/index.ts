/* eslint-disable no-unused-vars,no-console */
import path from 'path'
import { Server } from 'http'

import express, { Express, NextFunction, Response, Request } from 'express'
import bodyParser from 'body-parser'
import timeout from 'connect-timeout'
import * as Sentry from '@sentry/node'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import compression from 'compression'

import auth from './middleware/auth'
import login from './middleware/login'
import { config as configEnv } from './config'
import { errorHandler } from './helpers'

import { userRouter } from 'server/routes/user'

const isProd = process.env.NODE_ENV === 'production'
const basePath = isProd ? '..' : '../..'


// APP

const PORT = process.env.PORT || 8080
const app: Express = express()

Sentry.init({ dsn: `https://${configEnv?.SENTRY_DSN}` })
app.use(Sentry.Handlers.requestHandler())

function shouldCompress (req: Request, res: Response) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }

  // fallback to standard filter function
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return compression.filter(req, res)
}

app.use(compression({ filter: shouldCompress }))


const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minute
  max: 10000, // limit each IP to 100 requests per windowMs
})

app.use(limiter)

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
)
app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(timeout(configEnv.TIME_OUT || '10s'))


const routes = ['', '/', '/login', '/profile']

routes.forEach(
  (route) => app.use(route, express.static(path.join(__dirname, `${basePath}/dist`))),
)

// API routes
app.use('/api/user', userRouter)


app.get(['/api/', '/api', '/info', '/api/info'], (req: Request, res: Response) => {
  console.log('api info')
  console.log('======= REQUEST =========')
  console.log(req)
  console.log('======= RESPONSE =========')
  console.log(res)
  // eslint-disable-next-line require-atomic-updates, @typescript-eslint/ban-ts-comment
  // @ts-ignore
  res.json({ result: `core-node api, v${configEnv.API_VERSION}`,
    features: [
      'Login',
      'Authentication verification of token',
    ] })
})

app.get('/api/debug-sentry', () => {
  throw new Error('TEST Sentry error')
})

app.post(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  '/api/auth-test', login, (req: IFreeRequest, res: Response, next: NextFunction) => {
    console.log('pre auth test')
    console.log('req', req)
    console.log('req.body', req.body)
    next()
  }, auth, (req: IFreeRequest, res: Response) => {
    console.log('auth test')
    console.log('req', req)
    console.log('req.body', req.body)
    // eslint-disable-next-line require-atomic-updates, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    res.status(200).send({ user: req.user, token: req.token })
  },
)



app.use(Sentry.Handlers.errorHandler())

// default error handling
app.use(errorHandler)


const server: Server = app.listen(PORT, () => {
  console.log('Inospiner express app running at 8080')
  Sentry.captureMessage(
    // eslint-disable-next-line require-atomic-updates, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    `listening on port: ${(server.address())?.port}, host: ${(server.address()).address}`,
  )
})

process.on('uncaughtException', (error) => {
  console.log('Uncaught Exception')
  errorHandler(error)
})

process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Rejection')
  errorHandler(reason)
})

// TODO pm2, https://www.npmjs.com/package/express-limiter
