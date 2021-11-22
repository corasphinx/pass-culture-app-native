import { t } from '@lingui/macro'
import { useNavigation } from '@react-navigation/native'
import React, { FunctionComponent } from 'react'
import styled from 'styled-components/native'

import { IdentificationSessionResponse } from 'api/gen'
import { useRequestIdentificationUrl } from 'features/identityCheck/api'
import { UseNavigationType } from 'features/navigation/RootNavigator'
import { WEBAPP_V2_URL } from 'libs/environment'
import { ButtonPrimary } from 'ui/components/buttons/ButtonPrimary'
import { AppModal } from 'ui/components/modals/AppModal'
import { ArrowPrevious } from 'ui/svg/icons/ArrowPrevious'
import { Flash } from 'ui/svg/icons/Flash'
import { IdCard } from 'ui/svg/icons/IdCard'
import { Sun } from 'ui/svg/icons/Sun'
import { IconInterface } from 'ui/svg/icons/types'
import { ColorsEnum, getSpacing, Typo } from 'ui/theme'

interface Props {
  visible: boolean
  hideModal: () => void
}

const redirectUrl = `${WEBAPP_V2_URL}/verification-identite/fin`
// TODO(antoinewg): dehardcode this url and get it from the backend
const identificationUrl = 'https://id.ubble.ai/70f01f19-6ec5-4b14-9b30-2c493e49df15'

export const SomeAdviceBeforeIdentityCheckModal: FunctionComponent<Props> = ({
  visible,
  hideModal,
}) => {
  const { navigate } = useNavigation<UseNavigationType>()

  const { mutate: requestIdentificationUrl } = useRequestIdentificationUrl({
    onSuccess(data: IdentificationSessionResponse) {
      navigate('IdentityCheckWebview', { identificationUrl: data.identificationUrl })
    },
    onError() {
      // Backend call may result in 500 whilst testing
      // TODO(antoinewg) remove this line when ready
      navigate('IdentityCheckWebview', { identificationUrl })
    },
    onSettled() {
      hideModal()
    },
  })

  const onPressContinue = () => {
    requestIdentificationUrl(redirectUrl)
  }

  return (
    <AppModal
      visible={visible}
      title={t`Quelques conseils`}
      leftIconAccessibilityLabel={t`Revenir en arrière`}
      leftIcon={ArrowPrevious}
      onLeftIconPress={hideModal}
      rightIconAccessibilityLabel={undefined}
      rightIcon={undefined}
      onRightIconPress={undefined}>
      <Description>
        <Typo.Body>
          {t`Il est important que les informations de ton document soient parfaitement lisibles.`}
          {'\n'}
          {t`Nos conseils :`}
        </Typo.Body>
      </Description>
      <Instructions>
        <Instruction title={t`Désactive ton flash`} Icon={Flash} />
        <Instruction title={t`Place-toi dans un lieu bien éclairé`} Icon={Sun} />
        <Instruction title={t`Cadre l’intégralité de ton document`} Icon={IdCard} />
      </Instructions>
      <ButtonPrimary title={t`J'ai compris`} onPress={onPressContinue} />
    </AppModal>
  )
}

const Description = styled.Text({ textAlign: 'center' })

interface InstructionProps {
  title: string
  Icon: React.FunctionComponent<IconInterface>
}

const Instruction = ({ title, Icon }: InstructionProps) => (
  <InstructionContainer>
    <Icon size={getSpacing(6)} color={ColorsEnum.SECONDARY} color2={ColorsEnum.PRIMARY} />
    <Text>{title}</Text>
  </InstructionContainer>
)

const InstructionContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: getSpacing(3),
})

const Text = styled(Typo.Body)({ paddingLeft: getSpacing(2) })
const Instructions = styled.View({ width: '100%', paddingVertical: getSpacing(6) })