import { ExclusivityPane } from 'features/home/contentful'
import { shouldDisplayExcluOffer } from 'features/home/pages/useDisplayedHomeModules.utils'
import { offerResponseSnap as offer } from 'features/offer/api/snaps/offerResponseSnap'
import { GeoCoordinates } from 'libs/geolocation'

let userLocation: GeoCoordinates | null = null
let display: ExclusivityPane['display'] = {
  aroundRadius: 20,
  isGeolocated: true,
  title: 'Rayon de 20 km',
}

describe('shouldDisplayExcluOffer', () => {
  it('should display offer if no display parameters available', () => {
    const result = shouldDisplayExcluOffer(undefined, offer, userLocation)
    expect(result).toBe(true)
  })

  describe('user with geolocation activated', () => {
    it('should display offer if user is within radius', () => {
      userLocation = { latitude: 20, longitude: 2 }
      const result = shouldDisplayExcluOffer(display, offer, userLocation)
      expect(result).toBe(true)
    })

    it('should not display offer if user is too far from offer', () => {
      userLocation = { latitude: 52.5, longitude: 13.4 }
      const result = shouldDisplayExcluOffer(display, offer, userLocation)
      expect(result).toBe(false)
    })

    it('should not display offer if offer coodinates are not available', () => {
      userLocation = { latitude: 20, longitude: 2 }
      const coordinates = { latitude: undefined, longitude: undefined }
      const offerWithoutCoordinates = { ...offer, venue: { ...offer.venue, coordinates } }
      const result = shouldDisplayExcluOffer(display, offerWithoutCoordinates, userLocation)
      expect(result).toBe(false)
    })
  })

  describe('user with geolocation deactivated', () => {
    beforeEach(() => {
      userLocation = null
    })

    it('should display offer if module is not geolocated', () => {
      display = { aroundRadius: 20, isGeolocated: false, title: 'Rayon de 20 km' }
      const result = shouldDisplayExcluOffer(display, offer, userLocation)
      expect(result).toBe(true)
    })

    it('should not display offer if module is geolocated', () => {
      display = { aroundRadius: 20, isGeolocated: true, title: 'Rayon de 20 km' }
      const result = shouldDisplayExcluOffer(display, offer, userLocation)
      expect(result).toBe(false)
    })
  })
})
