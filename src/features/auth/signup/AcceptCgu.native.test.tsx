import * as netInfoModule from '@react-native-community/netinfo'
import { StackScreenProps } from '@react-navigation/stack'
import { rest } from 'msw'
import React from 'react'
import { Linking } from 'react-native'
import waitForExpect from 'wait-for-expect'

import { navigate } from '__mocks__/@react-navigation/native'
import { api } from 'api/api'
import { AccountRequest } from 'api/gen'
import { AuthContext } from 'features/auth/AuthContext'
import { contactSupport } from 'features/auth/support.services'
import { mockGoBack } from 'features/navigation/__mocks__/useGoBack'
import { RootStackParamList } from 'features/navigation/RootNavigator'
import { analytics } from 'libs/analytics'
import { env } from 'libs/environment'
import { EmptyResponse } from 'libs/fetch'
import { MonitoringError } from 'libs/monitoring'
import { reactQueryProviderHOC } from 'tests/reactQueryProviderHOC'
import { server } from 'tests/server'
import { simulateWebviewMessage, fireEvent, render, superFlushWithAct, waitFor } from 'tests/utils'
import { ColorsEnum } from 'ui/theme'

import { AcceptCgu } from './AcceptCgu'

jest.mock('features/auth/settings')
jest.mock('libs/monitoring')

function simulateNoNetwork() {
  jest.spyOn(netInfoModule, 'useNetInfo').mockReturnValue({
    isConnected: false,
  } as netInfoModule.NetInfoState)
}

function simulateConnectedNetwork() {
  jest.spyOn(netInfoModule, 'useNetInfo').mockReturnValue({
    isConnected: true,
  } as netInfoModule.NetInfoState)
}

describe('AcceptCgu Page', () => {
  it('should navigate to the previous page on back navigation', () => {
    simulateConnectedNetwork()
    const { getByTestId } = renderAcceptCGU()
    const leftIcon = getByTestId('leftIcon')
    fireEvent.press(leftIcon)

    expect(mockGoBack).toBeCalledTimes(1)
  })

  it('should open mail app when clicking on contact support button', async () => {
    simulateConnectedNetwork()
    const { findByText } = renderAcceptCGU()

    const contactSupportButton = await findByText('Contacter le support')
    fireEvent.press(contactSupportButton)
    await superFlushWithAct()

    await waitForExpect(() => {
      expect(contactSupport.forGenericQuestion).toBeCalledTimes(1)
    })
  })

  it('should redirect to the "CGU" page', async () => {
    simulateConnectedNetwork()

    const { getByTestId } = renderAcceptCGU()

    const link = getByTestId('external-link-cgu')
    fireEvent.press(link)

    await waitForExpect(() => {
      expect(Linking.openURL).toHaveBeenCalledWith(env.CGU_LINK)
    })
  })

  it('should redirect to the "Politique de confidentialité" page', async () => {
    simulateConnectedNetwork()

    const { getByTestId } = renderAcceptCGU()

    const link = getByTestId('external-link-privacy-policy')
    fireEvent.press(link)

    await waitForExpect(() => {
      expect(Linking.openURL).toHaveBeenCalledWith(env.PRIVACY_POLICY_LINK)
    })
  })

  it("should NOT open reCAPTCHA challenge's modal when there is no network", async () => {
    simulateNoNetwork()
    const renderAPI = renderAcceptCGU()
    const recaptchaWebviewModal = renderAPI.getByTestId('recaptcha-webview-modal')
    expect(recaptchaWebviewModal.props.visible).toBeFalsy()

    fireEvent.press(renderAPI.getByText('Accepter et s’inscrire'))

    expect(recaptchaWebviewModal.props.visible).toBeFalsy()
    expect(renderAPI.queryByText('Hors connexion : en attente du réseau.')).toBeTruthy()
    expect(renderAPI.queryByTestId('button-isloading-icon')).toBeFalsy()
  })

  it("should open reCAPTCHA challenge's modal when pressing on signup button", () => {
    simulateConnectedNetwork()
    const renderAPI = renderAcceptCGU()
    const recaptchaWebviewModal = renderAPI.getByTestId('recaptcha-webview-modal')

    expect(recaptchaWebviewModal.props.visible).toBeFalsy()

    fireEvent.press(renderAPI.getByText('Accepter et s’inscrire'))

    expect(recaptchaWebviewModal.props.visible).toBeTruthy()
  })

  it('should call API to create user account when reCAPTCHA challenge is successful', async () => {
    simulateConnectedNetwork()
    const postnativev1accountSpy = jest.spyOn(api, 'postnativev1account')
    server.use(
      rest.post<AccountRequest, EmptyResponse>(
        env.API_BASE_URL + '/native/v1/account',
        (_req, res, ctx) => res.once(ctx.status(200), ctx.json({}))
      )
    )
    const renderAPI = renderAcceptCGU()
    fireEvent.press(renderAPI.getByText('Accepter et s’inscrire'))
    const recaptchaWebview = renderAPI.getByTestId('recaptcha-webview')

    simulateWebviewMessage(recaptchaWebview, '{ "message": "success", "token": "fakeToken" }')

    await waitFor(() => {
      expect(postnativev1accountSpy).toBeCalledWith(
        {
          birthdate: '12-2-1995',
          email: 'john.doe@example.com',
          marketingEmailSubscription: true,
          password: 'password',
          token: 'fakeToken',
          postalCode: '35000',
          appsFlyerPlatform: 'ios',
          appsFlyerUserId: 'uniqueCustomerId',
        },
        { credentials: 'omit' }
      )
      expect(navigate).toBeCalledWith('SignupConfirmationEmailSent', {
        email: 'john.doe@example.com',
      })
      expect(renderAPI.queryByTestId('button-isloading-icon')).toBeFalsy()
    })
  })

  it('should log monitoring error and display error message when API call to create user account fails', async () => {
    simulateConnectedNetwork()
    const postnativev1accountSpy = jest.spyOn(api, 'postnativev1account')
    server.use(
      rest.post<AccountRequest, EmptyResponse>(
        env.API_BASE_URL + '/native/v1/account',
        (_req, res, ctx) => res.once(ctx.status(400), ctx.json({}))
      )
    )
    const renderAPI = renderAcceptCGU()
    fireEvent.press(renderAPI.getByText('Accepter et s’inscrire'))
    const recaptchaWebview = renderAPI.getByTestId('recaptcha-webview')

    simulateWebviewMessage(recaptchaWebview, '{ "message": "success", "token": "fakeToken" }')

    const requestBody = {
      birthdate: '12-2-1995',
      email: 'john.doe@example.com',
      marketingEmailSubscription: true,
      password: 'password',
      postalCode: '35000',
      token: 'fakeToken',
    }
    await waitFor(() => {
      expect(postnativev1accountSpy).toBeCalledWith(
        { ...requestBody, appsFlyerPlatform: 'ios', appsFlyerUserId: 'uniqueCustomerId' },
        { credentials: 'omit' }
      )
      expect(
        renderAPI.queryByText("Un problème est survenu pendant l'inscription, réessaie plus tard.")
      ).toBeTruthy()
      expect(MonitoringError).toHaveBeenNthCalledWith(
        1,
        `Request info : ${JSON.stringify({
          ...requestBody,
          password: 'excludedFromSentryLog',
          captchaSiteKey: env.SITE_KEY,
        })}`,
        'AcceptCguSignUpError'
      )
      expect(navigate).not.toBeCalled()
      expect(renderAPI.queryByTestId('button-isloading-icon')).toBeFalsy()
    })
  })

  it('should NOT call API to create user account when reCAPTCHA challenge was failed', async () => {
    simulateConnectedNetwork()
    const postnativev1accountSpy = jest.spyOn(api, 'postnativev1account')
    const renderAPI = renderAcceptCGU()
    fireEvent.press(renderAPI.getByText('Accepter et s’inscrire'))
    const recaptchaWebview = renderAPI.getByTestId('recaptcha-webview')

    simulateWebviewMessage(recaptchaWebview, '{ "message": "error", "error": "someError" }')

    await waitFor(() => {
      expect(
        renderAPI.queryByText("Un problème est survenu pendant l'inscription, réessaie plus tard.")
      ).toBeTruthy()
      expect(MonitoringError).toHaveBeenNthCalledWith(1, 'someError', 'AcceptCguOnReCaptchaError')
      expect(postnativev1accountSpy).not.toBeCalled()
      expect(navigate).not.toBeCalled()
      expect(renderAPI.queryByTestId('button-isloading-icon')).toBeFalsy()
    })
  })

  it('should NOT call API to create user account when reCAPTCHA token has expired', async () => {
    simulateConnectedNetwork()
    const postnativev1accountSpy = jest.spyOn(api, 'postnativev1account')
    const renderAPI = renderAcceptCGU()
    fireEvent.press(renderAPI.getByText('Accepter et s’inscrire'))
    const recaptchaWebview = renderAPI.getByTestId('recaptcha-webview')

    simulateWebviewMessage(recaptchaWebview, '{ "message": "expire" }')

    await waitFor(() => {
      expect(renderAPI.queryByText('Le token reCAPTCHA a expiré, tu peux réessayer.')).toBeTruthy()
      expect(postnativev1accountSpy).not.toBeCalled()
      expect(navigate).not.toBeCalled()
      expect(renderAPI.queryByTestId('button-isloading-icon')).toBeFalsy()
    })
  })

  it('should open quit signup modal', () => {
    simulateConnectedNetwork()
    const { getByTestId, queryByText } = renderAcceptCGU()

    const rightIcon = getByTestId('rightIcon')
    fireEvent.press(rightIcon)

    const title = queryByText("Veux-tu abandonner l'inscription ?")
    expect(title).toBeTruthy()
  })

  it('should display 4 step dots with the last one as current step', () => {
    simulateConnectedNetwork()
    const { getAllByTestId } = renderAcceptCGU()
    const dots = getAllByTestId('dot-icon')
    expect(dots.length).toBe(4)
    expect(dots[3].props.fill).toEqual(ColorsEnum.PRIMARY)
  })

  describe('<AcceptCgu /> - Analytics', () => {
    it('should log CancelSignup when clicking on "Abandonner l\'inscription"', () => {
      simulateConnectedNetwork()
      const { getByTestId, getByText } = renderAcceptCGU()

      const rightIcon = getByTestId('rightIcon')
      fireEvent.press(rightIcon)

      const abandonButton = getByText("Abandonner l'inscription")
      fireEvent.press(abandonButton)

      expect(analytics.logCancelSignup).toHaveBeenCalledTimes(1)
      expect(analytics.logCancelSignup).toHaveBeenCalledWith('CGU')
    })
  })
})

function renderAcceptCGU() {
  const navigationProps = {
    route: {
      params: {
        email: 'john.doe@example.com',
        isNewsletterChecked: true,
        password: 'password',
        birthday: '12-2-1995',
        postalCode: '35000',
      },
    },
  } as StackScreenProps<RootStackParamList, 'AcceptCgu'>

  return render(
    // eslint-disable-next-line local-rules/no-react-query-provider-hoc
    reactQueryProviderHOC(
      <AuthContext.Provider
        value={{
          isLoggedIn: true,
          setIsLoggedIn: jest.fn(),
        }}>
        <AcceptCgu {...navigationProps} />
      </AuthContext.Provider>
    )
  )
}
