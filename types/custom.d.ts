interface IUserRequest extends express.Request {
  user: {
    email: string
    id: number
    orgid?: number
    firstname?: string
    lastname?: string
    userrole?: number
    username: string
  }
  userData?: Record<string, any>
  uid?: string
  body?: Record<string, unknown>
}

interface IFreeRequest extends IUserRequest {
  token? : string
  headers: Record<string, any>
}

type JwtDecoded = {
  username: string
  id?: number | string
  // eslint-disable-next-line camelcase
  user_id: number | string
  email: string
  orgid?: number
  firstname?: string
  lastname?: string
  userrole?: number
  preferenceId?: number
  workspaceId?: number
  widgetId?: number
  exp: number
}
