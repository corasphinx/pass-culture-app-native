import { t } from '@lingui/macro'
import { Platform } from 'react-native'

import { VenueResponse } from 'api/gen'
import { generateLongFirebaseDynamicLink, WEBAPP_NATIVE_REDIRECTION_URL } from 'features/deeplinks'
import { getScreenPath } from 'features/navigation/RootNavigator/linking/getScreenPath'
import { analytics } from 'libs/analytics'
import { env, useWebAppUrl, WEBAPP_V2_URL } from 'libs/environment'
import { useFunctionOnce } from 'libs/hooks'
import { MonitoringError } from 'libs/monitoring'
import { share } from 'libs/share'

import { useVenue } from '../api/useVenue'

function getVenuePath(id: number) {
  return getScreenPath('Venue', { id })
}

export function getWebappVenueUrl(venueId: number, webAppUrl: string) {
  const path = getVenuePath(venueId)
  if (webAppUrl === WEBAPP_V2_URL) {
    return `${webAppUrl}${path}`
  }
  if (webAppUrl === env.WEBAPP_URL) {
    return `${WEBAPP_NATIVE_REDIRECTION_URL}/${path}`
  }
  throw new MonitoringError(
    `webAppUrl=${webAppUrl} should be equal to WEBAPP_V2_URL=${WEBAPP_V2_URL} or env.WEBAPP_URL=${env.WEBAPP_URL}`
  )
}

const shareVenue = async (venue: VenueResponse, webAppUrl: string) => {
  const message = t({
    id: 'share venue message',
    values: { name: venue.publicName || venue.name },
    message: 'Retrouve "{name}" sur le pass Culture',
  })

  const deepLink = `${WEBAPP_V2_URL}${getVenuePath(venue.id)}`
  const webAppLink = getWebappVenueUrl(venue.id, webAppUrl)

  const url = generateLongFirebaseDynamicLink(deepLink, webAppLink)

  // url share content param is only for iOs, so we add url in message for android
  const completeMessage = Platform.OS === 'ios' ? message : message.concat(`\n\n${url}`)

  const shareContent = {
    message: completeMessage,
    url, // iOS only
    title: message, // android only
  }
  const shareOptions = {
    subject: message, // iOS only
    dialogTitle: message, // android only
  }
  await share(shareContent, shareOptions)
}

export const useShareVenue = (venueId: number): (() => Promise<void>) => {
  const { data: venue } = useVenue(venueId)
  const webAppUrl = useWebAppUrl()

  const logShareVenue = useFunctionOnce(() => {
    analytics.logShareVenue(venueId)
  })

  return async () => {
    logShareVenue()
    if (!venue || !webAppUrl) return
    await shareVenue(venue, webAppUrl)
  }
}
