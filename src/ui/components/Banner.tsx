import React from 'react'
import { View } from 'react-native'
import styled from 'styled-components/native'

import { Clock } from 'ui/svg/icons/Clock'
import { WarningDeprecated } from 'ui/svg/icons/Warning_deprecated'
import { ColorsEnum, Spacer, getSpacing, Typo } from 'ui/theme'

export enum BannerType {
  INFO = 'info',
  TIME = '',
}

type Props = {
  title: string
  type?: BannerType
}

const renderIcon = (type: BannerType) => {
  switch (type) {
    case BannerType.INFO:
      return <WarningDeprecated size={32} color={ColorsEnum.BLACK} />
    case BannerType.TIME:
      return <Clock size={32} color={ColorsEnum.GREY_DARK} />
    default:
      return <WarningDeprecated size={32} color={ColorsEnum.BLACK} />
  }
}

export const Banner: React.FC<Props> = ({ title, type = BannerType.INFO }) => (
  <Background>
    <Spacer.Row numberOfSpaces={4} />
    {renderIcon(type)}
    <Spacer.Row numberOfSpaces={4} />
    <TextContainer>
      <Typo.Caption color={ColorsEnum.BLACK}>{title}</Typo.Caption>
    </TextContainer>
    <Spacer.Row numberOfSpaces={5} />
  </Background>
)

const Background = styled(View)({
  display: 'flex',
  backgroundColor: ColorsEnum.GREY_LIGHT,
  paddingVertical: getSpacing(4),
  alignItems: 'center',
  flexDirection: 'row',
  borderRadius: getSpacing(2),
})

const TextContainer = styled(View)({
  flexShrink: 1,
})
