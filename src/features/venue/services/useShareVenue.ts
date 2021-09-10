import { t } from '@lingui/macro'
import { Platform, Share } from 'react-native'

import { VenueResponse } from 'api/gen'
import { generateLongFirebaseDynamicLink } from 'features/deeplinks'
import { env } from 'libs/environment'

import { useVenue } from '../api/useVenue'

const shareVenue = async (venue: VenueResponse, webAppUrl: string) => {
  const { id, name } = venue

  const message = t({
    id: 'share venue message',
    values: { name },
    message: 'Retrouve "{name}" sur le pass Culture',
  })

  const url = generateLongFirebaseDynamicLink('venue', webAppUrl, `id=${id}`)

  // url share content param is only for iOs, so we add url in message for android
  const completeMessage = Platform.OS === 'ios' ? message : message.concat(`\n\n${url}`)

  const shareContent = {
    message: completeMessage,
    url, // iOs only
    title: message, // android only
  }

  const shareOptions = {
    subject: message, // iOs only
    dialogTitle: message, // android only
  }

  await Share.share(shareContent, shareOptions)
}

export const useShareVenue = (venueId: number): (() => Promise<void>) => {
  const { data: venue } = useVenue(venueId)
  const webAppUrl = `https://${env.WEBAPP_V2_DOMAIN}` // useWebAppUrl()

  return async () => {
    if (!venue || !webAppUrl) return
    await shareVenue(venue, webAppUrl)
  }
}
