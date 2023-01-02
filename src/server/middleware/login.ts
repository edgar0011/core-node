
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { NextFunction, Request, Response } from 'express'

import { config as configEnv, TOKEN_HEADER_NAME } from '../config'
import { errorHandler } from '../helpers'



initializeApp({
  apiKey: configEnv.FB_API_KEY,
  authDomain: configEnv.FB_AUTH_DOMAIN,
})


export default async (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password } = req.body

  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.log('email, username, password', email, username, password)
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  try {
    const response = await signInWithEmailAndPassword(getAuth(), email || username, password)

    console.log('Login, response')
    console.log(response)
    const { user } = response

    console.log('Login, user')
    console.log(user)
    const idToken = await getAuth()?.currentUser?.getIdToken(true)

    req.headers[TOKEN_HEADER_NAME] = `Bearer ${idToken}`
    return next()
  } catch (error) {
    // return res.status(400).send(error ? `FB: ${error}` : 'Invalid Login Credentials');
    // return errorHandler('Invalid Login Credentials', req, res, next, 400)
    return errorHandler(error, req, res, next, 400)
  }
}
