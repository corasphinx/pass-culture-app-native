import React from 'react'
import styled from 'styled-components/native'

import { useLocationChoice } from 'features/search/components/locationChoice.utils'
import { LocationType } from 'features/search/enums'
import { ArrowNext } from 'ui/svg/icons/ArrowNext'
import { Validate } from 'ui/svg/icons/Validate'
import { getSpacing, Spacer, Typo, ColorsEnum } from 'ui/theme'
import { ACTIVE_OPACITY } from 'ui/theme/colors'

type Props = {
  section: LocationType.PLACE | LocationType.EVERYWHERE | LocationType.AROUND_ME
  testID: string
  onPress?: () => void
  arrowNext?: boolean
}

export const LocationChoice: React.FC<Props> = (props) => {
  const { section, onPress, arrowNext = false, testID } = props
  const { Icon, label, isSelected } = useLocationChoice(section)
  const iconColor2 = isSelected ? ColorsEnum.PRIMARY : ColorsEnum.SECONDARY

  return (
    <Container onPress={onPress} testID={`locationChoice-${testID}`}>
      <FirstPart>
        <Icon size={48} color2={iconColor2} />
        <TextContainer>
          <Typo.ButtonText
            numberOfLines={3}
            color={isSelected ? ColorsEnum.PRIMARY : ColorsEnum.BLACK}>
            {label}
          </Typo.ButtonText>
        </TextContainer>
      </FirstPart>
      <SecondPart>
        {!!isSelected && <Validate color={ColorsEnum.PRIMARY} testID="validateIcon" />}
        {!!arrowNext && <ArrowNext />}
        {!isSelected && !arrowNext ? <Spacer.Row numberOfSpaces={8} /> : null}
      </SecondPart>
    </Container>
  )
}

const Container = styled.TouchableOpacity.attrs(() => ({
  activeOpacity: ACTIVE_OPACITY,
}))({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: getSpacing(6),
})

const FirstPart = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
})

const TextContainer = styled.View({
  flex: 1,
  paddingHorizontal: getSpacing(2),
})

const SecondPart = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  height: '100%',
})
