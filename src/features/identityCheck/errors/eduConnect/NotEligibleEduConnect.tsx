import { AbandonButton } from 'components/layout/AbandonButton/AbandonButton'
import { Page } from 'components/layout/Page'
import React from 'react'
import { useIsSmallScreen } from 'services/responsive'
import styled from 'styled-components/native'
import { ColorsEnum } from 'theme/colors'
import { Axis } from 'theme/grid'
import { Row, Spacer } from 'ui/components'
import { StyledText } from 'ui/components/typography/StyledText'
import { TextProp } from 'ui/components/typography/types'
import { getGrid, getSpacing, getSpacingString } from 'ui/utils'

import { ScreenErrorProps } from 'libs/monitoring/errors'

import { useNotEligibleEduConnectErrorData } from '../hooks/useNotEligibleEduConnectErrorData'

export const NotEligibleEduConnect = ({ error: { message } }: ScreenErrorProps) => {
  const {
    title,
    description,
    titleAlignment,
    descriptionAlignment,
    Icon,
  } = useNotEligibleEduConnectErrorData(message)
  const { isSmallScreen } = useIsSmallScreen()

  return (
    <Page>
      <Spacer.Flex flex={2} />
      <Icon />
      <Spacer.Column numberOfSpaces={4} />
      <Row>
        <TextContainer>
          <Title textAlign={titleAlignment} color={ColorsEnum.WHITE}>
            {title}
          </Title>
          <Spacer.Column numberOfSpaces={4} />

          <Body
            textAlign={descriptionAlignment}
            color={ColorsEnum.WHITE}
            isSmallScreen={isSmallScreen}>
            {description}
          </Body>
        </TextContainer>
      </Row>

      <Spacer.Flex />
      <ButtonContainer>
        <AbandonButton
          pageName={'NotEligibleEduConnect'}
          title={"Retourner à l'accueil"}
          type={'primary'}
        />
      </ButtonContainer>
    </Page>
  )
}

const ButtonContainer = styled.View({
  marginTop: getSpacing(10),
  alignItems: 'stretch',
  alignSelf: 'stretch',
})

export const TextContainer = styled.View({
  maxWidth: getSpacing(88),
  flexDirection: 'column',
  alignItems: 'stretch',
  flex: 1,
})

export const Title = styled(StyledText)(({ theme }) => ({
  ...theme.typography.title2,
  fontSize: getSpacing(getGrid({ default: 6, sm: 5 }, Axis.HEIGHT)),
  alignSelf: 'center',
  textAlign: 'center',
}))

type TextBodyProps = TextProp & { isSmallScreen: boolean }
export const Body = styled(StyledText).attrs<TextBodyProps>((props) => props)<TextBodyProps>(
  ({ theme, isSmallScreen }) => ({
    ...theme.typography.body,
    fontSize: getSpacing(getGrid({ default: 3.75, sm: 3 }, Axis.HEIGHT)),
    lineHeight: getSpacingString(isSmallScreen ? 4 : 5),
  })
)
