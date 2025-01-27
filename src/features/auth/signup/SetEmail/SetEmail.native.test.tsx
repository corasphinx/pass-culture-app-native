import React from 'react'

import { navigate, useRoute } from '__mocks__/@react-navigation/native'
import { SetEmail } from 'features/auth/signup/SetEmail'
import { analytics } from 'libs/analytics'
import { fireEvent, render } from 'tests/utils'
import { ColorsEnum } from 'ui/theme'

describe('<SetEmail />', () => {
  beforeEach(() =>
    useRoute.mockImplementation(() => ({
      params: {},
    }))
  )
  afterEach(() => jest.resetAllMocks())

  it('should display disabled validate button when email input is not filled', async () => {
    const { getByTestId } = renderPage()

    const button = getByTestId('Continuer')
    expect(button.props.style.backgroundColor).toEqual(ColorsEnum.GREY_LIGHT)
  })

  it('should enable validate button when email input is filled', async () => {
    const { getByTestId, getByPlaceholderText } = renderPage()

    const emailInput = getByPlaceholderText('tonadresse@email.com')
    fireEvent.changeText(emailInput, 'john.doe@gmail.com')

    const button = getByTestId('Continuer')
    expect(button.props.style.backgroundColor).toEqual(ColorsEnum.PRIMARY)
  })

  it('should display 4 step dots with the first one as current step', () => {
    const { getAllByTestId } = renderPage()
    const dots = getAllByTestId('dot-icon')
    expect(dots.length).toBe(4)
    expect(dots[0].props.fill).toEqual(ColorsEnum.PRIMARY)
  })

  it('should open quit signup modal', () => {
    const { getByTestId, queryByText } = renderPage()

    const rightIcon = getByTestId('rightIcon')
    fireEvent.press(rightIcon)

    const title = queryByText("Veux-tu abandonner l'inscription ?")
    expect(title).toBeTruthy()
  })

  describe('Email Validation', () => {
    it('should redirect to SetPassword on valid email with email and newsletter params', () => {
      const { getByText, getByPlaceholderText, queryByText } = renderPage()

      const emailInput = getByPlaceholderText('tonadresse@email.com')
      fireEvent.changeText(emailInput, 'john.doe@gmail.com')

      const continueButton = getByText('Continuer')
      fireEvent.press(continueButton)

      expect(navigate).toBeCalledWith('SetPassword', {
        email: 'john.doe@gmail.com',
        isNewsletterChecked: false,
      })

      expect(queryByText("Format de l'e-mail incorrect")).toBeFalsy()
    })
    it('should reject email', () => {
      const { getByText, getByPlaceholderText, queryByText } = renderPage()

      const emailInput = getByPlaceholderText('tonadresse@email.com')
      fireEvent.changeText(emailInput, 'john.doe')

      const continueButton = getByText('Continuer')
      fireEvent.press(continueButton)

      expect(queryByText("Format de l'e-mail incorrect")).toBeTruthy()
    })
  })

  describe('<SetEmail /> - Analytics', () => {
    it('should log CancelSignup when clicking on "Abandonner l\'inscription"', () => {
      const { getByTestId, getByText } = renderPage()

      const rightIcon = getByTestId('rightIcon')
      fireEvent.press(rightIcon)

      const abandonButton = getByText("Abandonner l'inscription")
      fireEvent.press(abandonButton)

      expect(analytics.logCancelSignup).toHaveBeenCalledTimes(1)
      expect(analytics.logCancelSignup).toHaveBeenCalledWith('Email')
    })
  })
})

function renderPage() {
  return render(<SetEmail />)
}
