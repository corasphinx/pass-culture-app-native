import React, { FunctionComponent, memo, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import * as Animatable from 'react-native-animatable'
import styled from 'styled-components/native'

import { IconInterface } from 'ui/svg/icons/types'
import { ColorsEnum, getSpacing } from 'ui/theme'
import { ZIndex } from 'ui/theme/layers'

export interface ProgressBarProps {
  progress: number
  color: ColorsEnum
  icon: FunctionComponent<IconInterface>
  isAnimated?: boolean
}

const ProgressBarComponent: React.FC<ProgressBarProps> = ({
  color,
  progress,
  icon: Icon,
  isAnimated = false,
}) => {
  const barRef = useRef<Animatable.View & View>(null)
  const [barWidth, setBarWidth] = useState(0)

  useEffect(() => {
    if (barRef.current && barWidth && isAnimated) {
      barRef.current.transition(
        {
          transform: [
            {
              translateX: 0,
            },
          ],
        },
        {
          transform: [
            {
              translateX: barWidth * progress,
            },
          ],
        }
      )
    }
  }, [progress, barRef, barWidth])
  return (
    <Container>
      <IconContainer backgroundColor={color}>
        <Icon color={ColorsEnum.WHITE} testID="progress-bar-icon" />
      </IconContainer>
      <ProgressBarContainer>
        <Bar
          ref={barRef}
          onLayout={({
            nativeEvent: {
              layout: { width },
            },
          }) => setBarWidth(width)}
          isAnimated={isAnimated}
          progress={progress}
          backgroundColor={color}
          barWidth={barWidth}
          testID="progress-bar"
          useNativeDriver={true}
          duration={1000}
          easing={'ease-in-out'}
        />
      </ProgressBarContainer>
    </Container>
  )
}

export const ProgressBar = memo(ProgressBarComponent)

const Container = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  height: 40,
  maxHeight: 40,
})

const IconContainer = styled.View<{ backgroundColor: string }>(({ backgroundColor }) => ({
  width: 32,
  height: 32,
  borderRadius: 32,
  backgroundColor,
  zIndex: ZIndex.PROGRESSBAR_ICON,
  position: 'absolute',
}))

const ProgressBarContainer = styled.View({
  marginLeft: getSpacing(5),
  flexDirection: 'row',
  overflow: 'hidden',
  flex: 1,
  borderWidth: 2,
  borderColor: ColorsEnum.GREY_MEDIUM,
  borderRadius: 20,
  height: 20,
  zIndex: ZIndex.PROGRESSBAR,
  position: 'relative',
})

const Bar = styled(Animatable.View)<{
  backgroundColor: string
  progress: number
  isAnimated: boolean
  barWidth: number
}>(({ backgroundColor, progress, isAnimated, barWidth }) => ({
  backgroundColor,
  flex: isAnimated ? 1 : progress,
  position: 'relative',
  left: isAnimated ? -barWidth : 0,
  opacity: !isAnimated || barWidth ? 1 : 0,
}))
