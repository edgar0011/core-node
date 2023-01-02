import dotenv from 'dotenv'

const result: Record<string, any> = dotenv.config()

let configResults: Record<string, any>

if (!Object.keys(result).includes('error')) {
  configResults = result.parsed || {}
} else {
  configResults = {}
  const keys = Object.keys(process.env).filter((key) => key.toUpperCase() === key)

  keys.forEach((key) => {
    configResults[key] = process.env[key]
  })
}

export const config = configResults || {}
// TODO add getter that prioritizes process.env, then looks up in .env


export const TOKEN_HEADER_NAME = 'x-access-token'
