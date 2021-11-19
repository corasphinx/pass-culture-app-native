import React from 'react'
import styled from 'styled-components/native'

import { getSpacing, Typo } from 'ui/theme'
import { ColorsEnum } from 'ui/theme/colors'
import { BorderRadiusEnum } from 'ui/theme/grid'

interface Props {
  text: string
  width?: number
  height?: number
  slantAngle?: number
  testID?: string
}

export const SlantTag: React.FC<Props> = ({ text, width, height, testID, slantAngle }) => {
  return (
    <SlantTagContainer
      testID={testID}
      tagWidth={width ? width : undefined}
      tagHeight={height ? height : undefined}
      tagAngle={slantAngle ? slantAngle : undefined}>
      <StyledPrice tagAngle={slantAngle ? slantAngle : undefined}>{text}</StyledPrice>
    </SlantTagContainer>
  )
}

const StyledPrice = styled(Typo.Caption)<{
  tagAngle: number | undefined
}>(({ tagAngle }) => ({
  color: ColorsEnum.WHITE,
  transform: tagAngle ? `rotate(${-tagAngle}deg)` : `rotate(4.34deg)`,
  alignSelf: 'center',
}))

const SlantTagContainer = styled.View<{
  tagWidth: number | undefined
  tagHeight: number | undefined
  tagAngle: number | undefined
}>(({ tagWidth, tagHeight, tagAngle }) => ({
  backgroundColor: ColorsEnum.SECONDARY,
  justifyContent: 'center',
  borderRadius: BorderRadiusEnum.CHECKBOX_RADIUS,
  width: tagWidth ? tagWidth : 'auto',
  height: tagHeight ? tagHeight : 'auto',
  paddingVertical: tagHeight ? 0 : getSpacing(0.5),
  paddingHorizontal: tagWidth ? 0 : getSpacing(2.5),
  transform: tagAngle ? `rotate(${tagAngle}deg)` : `rotate(-4.34deg)`,
}))
