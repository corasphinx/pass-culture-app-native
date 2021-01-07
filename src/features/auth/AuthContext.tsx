import React, { useContext, useEffect, useState } from 'react'
import { useQueryClient } from 'react-query'

import { api } from 'api/api'
import { AccountRequest, SigninResponse } from 'api/gen'
import { firebaseAnalytics } from 'libs/analytics'
import { clearRefreshToken, saveRefreshToken } from 'libs/keychain'
import { clearAccessToken, getAccessToken, saveAccessToken } from 'libs/storage'

export interface IAuthContext {
  isLoggedIn: boolean
  setIsLoggedIn: (isLoggedIn: boolean) => void
  signUp: (data: AccountRequest) => Promise<boolean>
  signOut: () => Promise<void>
}

export const AuthContext = React.createContext<IAuthContext>({
  isLoggedIn: false,
  setIsLoggedIn: () => void 0,
  signUp: () => Promise.resolve(false),
  signOut: () => Promise.resolve(),
})

export function useAuthContext(): IAuthContext {
  return useContext(AuthContext)
}

export type LoginRoutineMethod = 'fromLogin' | 'fromSignup'

/**
 * Executes the minimal set of instructions required to proceed to the login
 * @param {SigninResponse} response
 * @param {LoginRoutineMethod} method The process that triggered the login routine
 */
export async function loginRoutine(response: SigninResponse, method: LoginRoutineMethod) {
  await saveRefreshToken(response.refreshToken)
  await saveAccessToken(response.accessToken)
  await firebaseAnalytics.logLogin({ method })
}

export const AuthWrapper = ({ children }: { children: Element }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    getAccessToken().then((accessToken) => {
      setIsLoggedIn(!!accessToken)
    })
  }, [])

  const signUp = async (body: AccountRequest) => {
    try {
      const response = await api.postnativev1account(body, { credentials: 'omit' })
      return !!response
    } catch (error) {
      return false
    }
  }

  const signOut = async () => {
    await clearAccessToken()
    await clearRefreshToken()
    await queryClient.removeQueries('userProfile')
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSignOut(): IAuthContext['signOut'] {
  const authContext = useAuthContext()
  return authContext.signOut
}

export function useSignUp(): IAuthContext['signUp'] {
  const authContext = useAuthContext()
  return authContext.signUp
}
