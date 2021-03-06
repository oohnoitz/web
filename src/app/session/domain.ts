import cookie from 'cookie'
import jwt from 'jsonwebtoken'

import { logIn } from './redux'
import { userMapper } from './transform'
import { NextPageContext } from 'next'

export const validateEmail = (email: string): boolean =>
  email != '' && !!email.match(/.+@.+/)

export const validatePassword = (password: string): boolean =>
  password != '' && password.length >= 6

export const validateDisplayName = (name: string): boolean =>
  /^([\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Connector_Punctuation}\p{Join_Control} _-]{2,18})$/u.exec(
    name,
  ) !== null

const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'session_token'

export const parseSessionFromContext = (ctx: NextPageContext) => {
  const request = ctx.req
  if (!request) {
    return
  }

  const cookies = cookie.parse(request.headers.cookie || '')
  const sessionCookie = cookies[sessionCookieName]
  const decoded: any = jwt.decode(sessionCookie)

  if (decoded && decoded.User && decoded.exp) {
    ctx.store.dispatch(
      logIn({
        expiresAt: decoded.exp,
        user: userMapper.fromRaw(decoded.User),
      }),
    )
  }
}
