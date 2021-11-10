import jwtDecode from 'jwt-decode'

interface AccessToken {
  exp: number
  fresh: boolean
  iat: number
  sub: string
  jti: string
  nbf: number
  type: string
  user_claims?: {
    user_id?: number
  }
}

export const decodeAccessToken = (token: string) => {
  try {
    return jwtDecode<AccessToken>(token)
  } catch {
    return null
  }
}

export const getUserIdFromAccesstoken = (accessToken: string) => {
  const tokenContent = decodeAccessToken(accessToken)

  return tokenContent?.user_claims?.user_id ?? null
}

type AccessTokenStatus = 'valid' | 'expired' | 'unknown'

export const getAccessTokenStatus = (accessToken: string | null): AccessTokenStatus => {
  if (!accessToken) return 'unknown'
  const tokenContent = decodeAccessToken(accessToken)
  if (!tokenContent?.exp) return 'unknown'
  return tokenContent.exp * 1000 > Date.now() ? 'valid' : 'expired'
}

type TokenStatusWithExpirationInformations = {
  status: 'unknown' | 'expired' | 'valid'
  timeBeforeExpiration?: number
}
const dateNow = Date.now()

// TODO (LucasBeneston) : Remove when api.getnativev1changeEmailToken() is available
const TEN_HOURS = 60 * 60 * 10
const ONE_SECOND = 1
const tokenExpirationDate = dateNow + TEN_HOURS - ONE_SECOND

// TODO (LucasBeneston) : Remove when api.getnativev1changeEmailToken() is available
export const getTokenStatusWithExpirationInformations = (
  tokenStatus: string | null
): TokenStatusWithExpirationInformations => {
  if (!tokenStatus) return { status: 'unknown' }
  if (!tokenExpirationDate) return { status: 'unknown' }
  const timeBeforeExpiration = tokenExpirationDate - dateNow
  return tokenExpirationDate > dateNow
    ? { status: 'valid', timeBeforeExpiration }
    : { status: 'expired' }
}

// TODO (LucasBeneston) : Use this when api.getnativev1changeEmailToken() is available
// export const getTokenStatusWithExpirationInformations = (
//   tokenStatus: string | null
// ): TokenStatusWithExpirationInformations => {
//   if (!tokenStatus) return { status: 'unknown' }
//   const tokenContent = decodeAccessToken(tokenStatus)
//   if (!tokenContent?.exp) return { status: 'unknown' }
//   const timeBeforeExpiration = tokenExpirationDate - dateNow
//   return tokenExpirationDate * 1000 > Date.now()
//     ? { status: 'valid', timeBeforeExpiration }
//     : { status: 'expired' }
// }
