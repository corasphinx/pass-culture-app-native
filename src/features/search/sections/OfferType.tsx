import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components/native'

import { SelectionLabel, TitleWithCount } from 'features/search/atoms'
import { useStagedSearch } from 'features/search/pages/SearchWrapper'
import { SectionTitle } from 'features/search/sections/titles'
import { SearchState } from 'features/search/types'
import { useLogFilterOnce } from 'features/search/utils/useLogFilterOnce'
import { AccordionItem } from 'ui/components/AccordionItem'
import { getSpacing } from 'ui/theme'

type OfferType = keyof SearchState['offerTypes']

export const OFFER_TYPES: Array<[OfferType, string]> = [
  ['isDigital', t`Offre numérique`],
  ['isEvent', t`Sortie`],
  ['isThing', t`Offre physique`],
]

export const OfferType: React.FC = () => {
  const logUseFilter = useLogFilterOnce(SectionTitle.OfferType)
  const { searchState, dispatch } = useStagedSearch()
  const { offerTypes } = searchState

  const onPress = (offerType: OfferType) => () => {
    dispatch({ type: 'OFFER_TYPE', payload: offerType })
    logUseFilter()
  }

  return (
    <AccordionItem
      defaultOpen={true}
      title={
        <TitleWithCount
          title={SectionTitle.OfferType}
          count={+offerTypes['isDigital'] + +offerTypes['isEvent'] + +offerTypes['isThing']}
        />
      }>
      <BodyContainer>
        {OFFER_TYPES.map(([offerType, label]) => (
          <SelectionLabel
            key={label}
            label={label}
            selected={offerTypes[offerType]}
            onPress={onPress(offerType)}
          />
        ))}
      </BodyContainer>
    </AccordionItem>
  )
}

const BodyContainer = styled.View({
  flexWrap: 'wrap',
  flexDirection: 'row',
  marginBottom: getSpacing(-3),
  marginRight: getSpacing(-3),
})
