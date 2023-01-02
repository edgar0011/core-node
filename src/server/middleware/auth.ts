/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-unused-vars,no-console */
import { Response, NextFunction } from 'express'
import * as admin from 'firebase-admin'
import jwt from 'jsonwebtoken'
import axios from 'axios'

import { TOKEN_HEADER_NAME } from '../config'
import { errorResponseHandler } from '../helpers'

const serviceAccount = require('../firebase-auth.json')


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const jwtVerify = async (token: string) => {
  // TODO cache untile expired
  // console.log('jwtVerify, token', token)
  const response = await axios.get(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
  )

  // console.log('jwtVerify, response', response)

  const decoded1 = jwt.decode(token, { complete: true })
  // console.log('jwt decoded1 --------------------------------->')
  // console.log(decoded1)
  // console.log('<--------------------------------- jwt decoded1')
  const keys = response.data
  const { alg, kid } = decoded1?.header || {}

  // TO DEBUG User logged out dou to Token expired... Firebase uth workaround
  // return jwt.verify(`${token}x`, keys[kid], { algorithms: [alg] }, (error, decoded) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return jwt.verify(token, keys[kid], { algorithms: [alg] }, (error, decoded) => {
    // console.log('jwt')
    // console.log('error', error)
    // console.log('jwt decoded --------------------------------->')
    // console.log(decoded)
    // console.log('<--------------------------------- jwt decoded')
    if (error) {
      throw error
    }
    return decoded
  })
}

export default async (req: IFreeRequest, res: Response, next: NextFunction) => {
  let token = (req.headers[TOKEN_HEADER_NAME] || req.headers.authorization || req.headers.Authorization) as string

  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length)
    try {
      let verified: Record<string, any> = {}

      try {
        verified = await jwtVerify(token)
        // verified = await admin.auth().verifyIdToken(token, true)
      } catch (error: any) {
        errorResponseHandler(res, 401, error, 'Not verified TOKEN')
      }
      if (!verified) {
        errorResponseHandler(res, 401, new Error('Verified TOKEN undefined'), 'Verified TOKEN undefined')
      } else {
        // eslint-disable-next-line require-atomic-updates
        req.token = token
        // eslint-disable-next-line require-atomic-updates, @typescript-eslint/ban-ts-comment
        // @ts-ignore
        req.user = verified
        req.uid = verified.user_id
        next()
      }
    } catch (error: any) {
      errorResponseHandler(res, 500, error, 'Error verifing TOKEN')
    }
  } else {
    errorResponseHandler(res, 404, 'Bad Request', 'Token undefind or not in valid format')
  }
}

export const signOut = (uid: string) => {
  try {
    admin.auth().revokeRefreshTokens(uid)
  } catch (error) {
    console.error(error)
    throw error
  }
}
