import * as Sentry from '@sentry/node'
import { Request, Response, NextFunction } from 'express'


// export const errorHandler = (error = null, message = null) => {
//   error && Sentry.captureException(error)
//   message && Sentry.captureMessage(message)
// }

const parseErrorTemplate1
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  = (error: any) => ({
    error: error?.errors?.map(({ message, type, path: field, value }: any) => ({ type, message, field, value })),
  })

export const errorHandler = (
  error: unknown, req?: Request, res?: Response, next?: NextFunction | null, status?: number, payload?: unknown,
): any => {
  // console.log('errorHandler START ======================================================================>')
  // console.error(error)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const translatedError = error?.errors?.length ? parseErrorTemplate1(error) : (error?.message || error)

  // console.error('translatedError')
  // console.error(translatedError)
  // console.error('status')
  // console.error(status)
  // console.error('payload')
  // console.error(payload)
  // console.log('errorHandler END <========================================================================')

  Sentry.captureException(translatedError)
  if (!res) {
    return null
  }

  if (res.headersSent) {
    return next && next(translatedError)
  }
  // res.render('error', { error: err })
  return res.status(status || 500).json(
    payload
    || (typeof translatedError === 'string'
      ? { error: { message: translatedError.replace(':', ' > ') } }
      : translatedError),
  )
}




// eslint-disable-next-line arrow-body-style
export const errorResponseHandler = (
  res: Response, status = 500, error: Error | string | null = null, message: string | null = null,
): unknown => res.status(status).send(error || message || 'error')


export const getRequestUserId = (req:Request): string | number => {
  const userId: string | number = ((req as unknown) as IUserRequest)?.user?.id
  || ((req as unknown) as IUserRequest)?.uid as string

  return userId
}
