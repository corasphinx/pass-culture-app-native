import React from 'react'

import { navigate } from '__mocks__/@react-navigation/native'
import { ExclusivityPane } from 'features/home/contentful'
import { offerResponseSnap as mockOffer } from 'features/offer/api/snaps/offerResponseSnap'
import { analytics } from 'libs/analytics'
import { render, fireEvent } from 'tests/utils'

import { ExclusivityModule } from '../ExclusivityModule'

const props: ExclusivityPane = {
  alt: "Image d'Adèle",
  image: 'https://fr.web.img6.acsta.net/medias/nmedia/18/96/46/01/20468669.jpg',
  id: mockOffer.id,
  moduleId: 'module-id',
  display: { isGeolocated: false, aroundRadius: undefined, title: '' },
}

const mockPosition = {
  latitude: mockOffer.venue.coordinates.latitude || 0 + 0.0001,
  longitude: mockOffer.venue.coordinates.latitude || 0 + 0.0001,
}
jest.mock('libs/geolocation', () => ({ useGeolocation: () => ({ position: mockPosition }) }))
jest.mock('features/offer/api/useOffer', () => ({ useOffer: () => ({ data: mockOffer }) }))

describe('ExclusivityModule component', () => {
  afterAll(() => jest.resetAllMocks())

  it('should render correctly', () => {
    const { toJSON } = renderExclusivityModule()
    expect(toJSON()).toMatchSnapshot()
  })

  it('should navigate to the offer when clicking on the image', () => {
    const { getByTestId } = renderExclusivityModule()
    fireEvent.press(getByTestId('imageExclu'))
    expect(navigate).toHaveBeenCalledWith('Offer', {
      id: mockOffer.id,
      from: 'home',
    })
  })

  it('should log a click event when clicking on the image', () => {
    const { getByTestId } = renderExclusivityModule()
    fireEvent.press(getByTestId('imageExclu'))
    expect(analytics.logClickExclusivityBlock).toHaveBeenCalledWith(mockOffer.id)
    expect(analytics.logConsultOffer).toHaveBeenCalledWith({
      offerId: mockOffer.id,
      from: 'exclusivity',
    })
  })
})

const renderExclusivityModule = () => {
  return render(<ExclusivityModule {...props} />)
}
