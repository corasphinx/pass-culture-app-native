import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { PixelRatio } from 'react-native'
import { useQueryClient } from 'react-query'
import styled from 'styled-components/native'

import {
  CategoryIdEnum,
  ExpenseDomain,
  OfferResponse,
  OfferStockResponse,
  OfferVenueResponse,
  SubcategoryIdEnum,
} from 'api/gen'
import { Referrals, UseNavigationType } from 'features/navigation/RootNavigator'
import { analytics } from 'libs/analytics'
import { QueryKeys } from 'libs/queryKeys'
import { accessibilityAndTestId } from 'tests/utils'
import { ImageCaption } from 'ui/components/ImageCaption'
import { ImageTile } from 'ui/components/ImageTile'
import { OfferCaption } from 'ui/components/OfferCaption'
import { MARGIN_DP } from 'ui/theme'
import { BorderRadiusEnum } from 'ui/theme/grid'

export interface OfferTileProps {
  categoryId: CategoryIdEnum | null | undefined
  categoryLabel: string | null
  subcategoryId: SubcategoryIdEnum
  distance?: string
  date?: string
  name?: string
  isDuo?: boolean
  offerId: number
  venueId?: number
  price: string
  thumbUrl?: string
  isBeneficiary?: boolean
  analyticsFrom: Referrals
  moduleName?: string
  width: number
  height: number
}

type PartialOffer = Pick<
  OfferTileProps,
  'categoryId' | 'thumbUrl' | 'isDuo' | 'name' | 'offerId' | 'subcategoryId'
>

// Here we do optimistic rendering: we suppose that if the offer is available
// as a search result, by the time the user clicks on it, the offer is still
// available, released, not sold out...
export const mergeOfferData = (offer: PartialOffer) => (
  prevData: OfferResponse | undefined
): OfferResponse => ({
  description: '',
  image: offer.thumbUrl ? { url: offer.thumbUrl } : undefined,
  isDuo: offer.isDuo || false,
  name: offer.name || '',
  isDigital: false,
  isExpired: false,
  // assumption. If wrong, we receive correct data once API call finishes.
  // In the meantime, we have to make sure no visual glitch appears.
  // For example, before displaying the CTA, we wait for the API call to finish.
  isEducational: false,
  isReleased: true,
  isSoldOut: false,
  id: offer.offerId,
  stocks: [] as Array<OfferStockResponse>,
  expenseDomains: [] as Array<ExpenseDomain>,
  accessibility: {},
  category: { label: '', name: undefined } as OfferResponse['category'],
  subcategoryId: offer.subcategoryId,
  venue: { coordinates: {} } as OfferVenueResponse,
  ...(prevData || {}),
})

export const OfferTile = (props: OfferTileProps) => {
  const {
    analyticsFrom,
    width,
    height,
    moduleName,
    isBeneficiary,
    categoryLabel,
    venueId,
    ...offer
  } = props

  const navigation = useNavigation<UseNavigationType>()
  const queryClient = useQueryClient()

  function handlePressOffer() {
    const { offerId } = offer
    // We pre-populate the query-cache with the data from the search result for a smooth transition
    queryClient.setQueryData([QueryKeys.OFFER, offerId], mergeOfferData(offer))
    analytics.logConsultOffer({ offerId, from: analyticsFrom, moduleName, venueId })
    navigation.navigate('Offer', { id: offerId, from: analyticsFrom, moduleName })
  }

  return (
    <Container>
      <TouchableHighlight
        height={height}
        onPress={handlePressOffer}
        {...accessibilityAndTestId('offerTile')}>
        <React.Fragment>
          <ImageTile
            width={width}
            height={height - IMAGE_CAPTION_HEIGHT}
            uri={offer.thumbUrl}
            onlyTopBorderRadius
          />
          <ImageCaption
            height={IMAGE_CAPTION_HEIGHT}
            width={width}
            categoryLabel={categoryLabel}
            distance={offer.distance}
          />
        </React.Fragment>
      </TouchableHighlight>
      <OfferCaption
        imageWidth={width}
        name={offer.name}
        date={offer.date}
        isDuo={offer.isDuo}
        isBeneficiary={isBeneficiary}
        price={offer.price}
      />
    </Container>
  )
}

const IMAGE_CAPTION_HEIGHT = PixelRatio.roundToNearestPixel(MARGIN_DP)

const Container = styled.View({ flex: 1 })

const TouchableHighlight = styled.TouchableHighlight<{ height: number }>(({ height }) => ({
  borderRadius: BorderRadiusEnum.BORDER_RADIUS,
  height,
}))
