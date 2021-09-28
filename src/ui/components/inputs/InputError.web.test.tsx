import React from 'react'

import { render } from 'tests/utils'

import { InputError } from './InputError'

describe('InputError Component', () => {
  it('should display the given message', () => {
    const { queryByText } = render(
      <InputError visible={true} messageId="message" numberOfSpacesTop={1} />
    )

    const text = queryByText('message')
    expect(text).toBeTruthy()
  })
  it('should hide the given message', () => {
    const { queryByText } = render(
      <InputError visible={false} messageId="message" numberOfSpacesTop={1} />
    )

    const text = queryByText('message')
    expect(text).toBeFalsy()
  })
})
