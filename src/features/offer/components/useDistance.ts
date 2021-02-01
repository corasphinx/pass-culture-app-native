import { useGeolocation } from 'libs/geolocation'
import { formatDistance } from 'libs/parsers'

export const useDistance = (offerPosition: { lat?: number; lng?: number }): string | undefined => {
  const { position: userPosition } = useGeolocation()
  if (!userPosition || !offerPosition) return undefined
  return formatDistance(offerPosition, userPosition)
}
