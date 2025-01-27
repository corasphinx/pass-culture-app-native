import React from 'react'

import { render } from 'tests/utils/web'
import { Close } from 'ui/svg/icons/Close'
import { ColorsEnum } from 'ui/theme'

import { AppButton } from './AppButton'

describe('AppButton Component', () => {
  describe('* Icon property', () => {
    it('should display icon when provided', () => {
      const { getByTestId } = render(
        <AppButton title="Testing Disabled" loadingIconColor={ColorsEnum.BLACK} icon={Close} />
      )
      getByTestId('button-icon')
    })
    it('should not display icon when not provided', () => {
      const { queryByTestId } = render(
        <AppButton title="Testing Disabled" loadingIconColor={ColorsEnum.BLACK} />
      )
      const icon = queryByTestId('button-icon')
      expect(icon).toBeFalsy()
    })
  })
  describe('* isLoading property', () => {
    it('should display right elements when isLoading equals true', () => {
      const { getByTestId, queryByTestId } = render(
        <AppButton
          title="Testing Disabled"
          loadingIconColor={ColorsEnum.BLACK}
          isLoading
          icon={Close}
        />
      )
      getByTestId('button-isloading-icon')
      const icon = queryByTestId('button-icon')
      expect(icon).toBeFalsy()
    })
    it('should display right elements when isLoading equals false', () => {
      const { getByTestId, queryByTestId } = render(
        <AppButton
          title="Testing Disabled"
          loadingIconColor={ColorsEnum.BLACK}
          isLoading={false}
          icon={Close}
        />
      )

      getByTestId('button-icon')
      const icon = queryByTestId('button-isloading-icon')
      expect(icon).toBeFalsy()
    })
  })

  describe('* inline property', () => {
    it('should use inline css style when true', () => {
      const renderAPI = render(
        <AppButton title="Testing inline" loadingIconColor={ColorsEnum.BLACK} icon={Close} inline />
      )
      expect(renderAPI).toMatchSnapshot()
    })
  })
})
