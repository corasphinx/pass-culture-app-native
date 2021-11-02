import { t } from '@lingui/macro'
import { useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import LottieView from 'lottie-react-native'
import React, { useEffect, useRef } from 'react'
import { useWindowDimensions } from 'react-native'
import styled from 'styled-components/native'

import { navigateToHome } from 'features/navigation/helpers'
import { RootStackParamList, UseNavigationType } from 'features/navigation/RootNavigator'
import StarAnimation from 'ui/animations/tutorial_star.json'
import { ButtonSecondary } from 'ui/components/buttons/ButtonSecondary'
import { ButtonTertiaryBlack } from 'ui/components/buttons/ButtonTertiaryBlack'
import { Spacer } from 'ui/components/spacer/Spacer'
import { PlainArrowPrevious } from 'ui/svg/icons/PlainArrowPrevious'
import { getSpacing, Typo } from 'ui/theme'

type SelectSchoolHomeProps = StackScreenProps<RootStackParamList, 'SelectSchoolHome'>
export const SelectSchoolHome: React.FC<SelectSchoolHomeProps> = ({
  route: { params: { nextBeneficiaryValidationStep } = {} },
}) => {
  const animation = useRef<LottieView>(null)
  const { navigate } = useNavigation<UseNavigationType>()
  const { width: appWidth } = useWindowDimensions()

  useEffect(() => {
    animation.current?.play?.(0, 62)
  }, [animation])

  return (
    <React.Fragment>
      <Spacer.Column numberOfSpaces={appWidth <= 375 ? 5 : 18} />
      <Container>
        <StyledLottieContainer>
          <LottieView ref={animation} source={StarAnimation} loop={false} autoSize={true} />
        </StyledLottieContainer>
        <TitleContainer>{t`Fais-tu partie de la phase de test ?`}</TitleContainer>
        <BodyContainer>
          {t`Si tu es élève dans` + '\u00a0'}
          <Strong>{t`l'un des 21 établissements de test`}</Strong>
          {'\u00a0' +
            t`des académies de Rennes ou de Versailles, tu fais partie de la phase de test du pass Culture 15-17 ans.`}
          {'\n\n'}
          {t`Tu pourras ainsi nous aider à améliorer l’application.`}
        </BodyContainer>

        <ButtonSecondary
          onPress={() =>
            navigate('SelectSchool', {
              nextBeneficiaryValidationStep,
            })
          }
          title={t`Voir les établissements partenaires`}
        />

        <CustomButtonTertiaryBlack
          onPress={navigateToHome}
          title={t`Retourner à l'accueil`}
          icon={PlainArrowPrevious}
        />
      </Container>
    </React.Fragment>
  )
}

const Container = styled.ScrollView(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.colors.white,
  flexDirection: 'column',
  padding: getSpacing(5),
}))

const TitleContainer = styled(Typo.Title1)({
  textAlign: 'center',
})

const BodyContainer = styled(Typo.Body)({
  textAlign: 'center',
  marginVertical: getSpacing(5),
})

const Strong = styled(Typo.Body)({
  fontWeight: 'bold',
})

const StyledLottieContainer = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
})

const CustomButtonTertiaryBlack = styled(ButtonTertiaryBlack)({
  marginTop: getSpacing(5),
})