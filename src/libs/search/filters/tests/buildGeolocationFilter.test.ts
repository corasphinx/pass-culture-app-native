import { LocationType } from 'features/search/enums'
import { SearchState } from 'features/search/types'
import { AppSearchFields } from 'libs/search/filters/constants'

import { buildGeolocationFilter } from '../buildGeolocationFilter'

type Params = SearchState['locationFilter']

const userLocation = {
  latitude: 42,
  longitude: 43,
}

const baseParams: Params = {
  aroundRadius: 10,
  locationType: LocationType.AROUND_ME,
}

describe('buildGeolocationFilter', () => {
  it('should not fetch with geolocation coordinates when latitude and longitude are not valid', () => {
    const params: Params = { ...baseParams }
    expect(buildGeolocationFilter(params, null)).toEqual([])
  })

  it('should fetch offers with geolocation coordinates, when latitude, longitude are provided and search is not around me', () => {
    const params: Params = { ...baseParams, locationType: LocationType.EVERYWHERE }
    expect(buildGeolocationFilter(params, userLocation)).toEqual([])
  })

  it('should fetch offers with geolocation coordinates, when latitude, longitude and radius are provided and search is around me', () => {
    const params: Params = { ...baseParams, aroundRadius: 135 }
    expect(buildGeolocationFilter(params, userLocation)).toEqual([
      {
        [AppSearchFields.venue_position]: {
          center: '42, 43',
          distance: 135,
          unit: 'km',
        },
      },
    ])
  })

  it('should fetch offers with geolocation coordinates, when latitude, longitude, search is around me, and radius equals zero', () => {
    const params: Params = { ...baseParams, aroundRadius: 0 }
    expect(buildGeolocationFilter(params, userLocation)).toEqual([
      {
        [AppSearchFields.venue_position]: {
          center: '42, 43',
          distance: 1,
          unit: 'm',
        },
      },
    ])
  })

  it('should fetch offers with geolocation coordinates, when latitude, longitude, search is around me, and radius is null', () => {
    const params: Params = { ...baseParams, aroundRadius: null }
    expect(buildGeolocationFilter(params, userLocation)).toEqual([])
  })
})
