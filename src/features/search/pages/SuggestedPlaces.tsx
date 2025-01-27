import { t } from '@lingui/macro'
import isEqual from 'lodash.isequal'
import uniqWith from 'lodash.uniqwith'
import React from 'react'
import { FlatList } from 'react-native'
import styled from 'styled-components/native'

import { getTabNavConfig } from 'features/navigation/TabBar/helpers'
import { useGoBack } from 'features/navigation/useGoBack'
import { usePlaces, useVenues } from 'features/search/api'
import { MAX_RADIUS } from 'features/search/pages/reducer.helpers'
import { useStagedSearch } from 'features/search/pages/SearchWrapper'
import { analytics } from 'libs/analytics'
import { SuggestedPlace } from 'libs/place'
import { SuggestedVenue } from 'libs/venue'
import { BicolorLocationPointer } from 'ui/svg/icons/BicolorLocationPointer'
import { LocationBuildingDeprecated } from 'ui/svg/icons/LocationBuilding_deprecated'
import { getSpacing, Spacer, Typo } from 'ui/theme'
import { ACTIVE_OPACITY, ColorsEnum } from 'ui/theme/colors'

type SuggestedPlaceOrVenue = SuggestedPlace | SuggestedVenue

export const isPlace = (hit: SuggestedPlaceOrVenue): hit is SuggestedPlace => !('venueId' in hit)
export const isVenue = (hit: SuggestedPlaceOrVenue): hit is SuggestedVenue => 'venueId' in hit

export const keyExtractor = (hit: SuggestedPlaceOrVenue) => {
  const { label, info } = hit
  const prefix = isVenue(hit) ? `venue-${hit.venueId}` : 'place'
  const suffix =
    isPlace(hit) && hit.geolocation
      ? `${hit.geolocation.latitude}-${hit.geolocation.longitude}`
      : 'no-geolocation'

  return `${prefix}-${label}-${info}-${suffix}`
}

const Hit: React.FC<{ hit: SuggestedPlaceOrVenue; onPress: () => void }> = ({ hit, onPress }) => {
  const Icon = isVenue(hit)
    ? () => <LocationBuildingDeprecated size={getSpacing(10)} color={ColorsEnum.PRIMARY} />
    : () => <BicolorLocationPointer size={getSpacing(10)} color2={ColorsEnum.PRIMARY} />

  return (
    <ItemContainer onPress={onPress} testID={keyExtractor(hit)}>
      <Icon />
      <Spacer.Row numberOfSpaces={2} />
      <Text numberOfLines={2}>
        <Typo.ButtonText>{hit.label}</Typo.ButtonText>
        <Spacer.Row numberOfSpaces={1} />
        <Typo.Body>{hit.info}</Typo.Body>
      </Text>
    </ItemContainer>
  )
}

export const SuggestedPlaces: React.FC<{ query: string }> = ({ query }) => {
  const { data: places = [], isLoading: isLoadingPlaces } = usePlaces(query)
  const { data: venues = [], isLoading: isLoadingVenues } = useVenues(query)
  const { dispatch } = useStagedSearch()
  const { goBack } = useGoBack(...getTabNavConfig('Search'))

  const onPickPlace = (hit: SuggestedPlaceOrVenue) => () => {
    if (isVenue(hit) && hit.venueId) {
      analytics.logChooseLocation({ type: 'venue', venueId: hit.venueId })
      dispatch({ type: 'SET_LOCATION_VENUE', payload: hit })
    } else if (isPlace(hit) && hit.geolocation) {
      analytics.logChooseLocation({ type: 'place' })
      dispatch({ type: 'SET_LOCATION_PLACE', payload: { aroundRadius: MAX_RADIUS, place: hit } })
    }
    // we need to call goBack twice, first to LocationPicker
    goBack()
    // then previous page
    goBack()
  }

  const filteredPlaces: SuggestedPlaceOrVenue[] = [
    ...venues.slice(0, 5),
    ...uniqWith(places, isEqual),
  ]
  const isLoading = isLoadingPlaces || isLoadingVenues

  return (
    <FlatList
      data={filteredPlaces}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => <Hit hit={item} onPress={onPickPlace(item)} />}
      ListEmptyComponent={() => <NoSuggestedPlaces show={query.length > 0 && !isLoading} />}
      ItemSeparatorComponent={Separator}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  )
}

const NoSuggestedPlaces = ({ show }: { show: boolean }) =>
  show ? (
    <DescriptionErrorTextContainer>
      <DescriptionErrorText>{t`Aucun lieu ne correspond à ta recherche`}</DescriptionErrorText>
    </DescriptionErrorTextContainer>
  ) : (
    <React.Fragment />
  )

const ItemContainer = styled.TouchableOpacity.attrs({
  activeOpacity: ACTIVE_OPACITY,
})({
  flexDirection: 'row',
  marginHorizontal: getSpacing(6),
  paddingVertical: getSpacing(4),
  alignItems: 'center',
})

const Text = styled.Text({ flex: 1 })

const Separator = styled.View({
  height: 2,
  backgroundColor: ColorsEnum.GREY_LIGHT,
  marginHorizontal: getSpacing(6),
})

const DescriptionErrorTextContainer = styled.Text({
  marginTop: getSpacing(6.5),
  textAlign: 'center',
})

const DescriptionErrorText = styled(Typo.Body)({ color: ColorsEnum.GREY_DARK })
