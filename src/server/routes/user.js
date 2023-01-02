/* eslint-disable no-unused-vars,no-console */
import express from 'express'
import { pick } from 'ramda'
import jwtDecode from 'jwt-decode'

import auth, { signOut } from '../middleware/auth'
import login from '../middleware/login'
import { errorResponseHandler } from '../helpers'

const router = express.Router()

router.post('/sign-out', auth, async (req, res) => {
  if (req.token) {
    // console.log('signOut req.token', req.token)
    console.log('signOut req.uid', req.uid)
    try {
      await signOut(req.uid)
      res.status(200).send('signed out')
    } catch (error) {
      errorResponseHandler(res, 500)
    }
  } else {
    errorResponseHandler(res, 500)
  }
})

router.get('/', auth, (req, res) => {
  res.status(200).json({
    result: {
      message: 'Hi there...GET',
      params: req.params,
      body: req.body,
      query: req.query,
    },
  })
})

router.post('/', auth, async (req, res) => {
  res.status(201).json({
    result: {
      message: 'Hi there...POST',
      params: req.params,
      body: req.body,
      query: req.query,
    },
  })
})


router.post('/login', login, auth, async (req, res) => {
  console.log('auth test')
  console.log('req', req)
  console.log('req.body', req.body)
  const decoded = jwtDecode(req.token)

  console.log('decoded', decoded)
  res.status(200).send({ user: { ...pick(['email'])(decoded), id: decoded.user_id }, token: req.token })
})


export const userRouter = router
