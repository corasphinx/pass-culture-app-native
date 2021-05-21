import { t } from '@lingui/macro'
import { ColorsEnum } from '@pass-culture/id-check/src/theme/colors'
import { useNavigation } from '@react-navigation/native'
import * as React from 'react'
import styled from 'styled-components/native'

import { useDeeplinkUrlHandler } from 'features/deeplinks/useDeeplinkUrlHandler'
import { resolveHandler } from 'features/deeplinks/utils'
import { UseNavigationType } from 'features/navigation/RootNavigator'
import { ButtonPrimaryWhite } from 'ui/components/buttons/ButtonPrimaryWhite'
import { ButtonTertiaryWhite } from 'ui/components/buttons/ButtonTertiaryWhite'
import { GenericInfoPage } from 'ui/components/GenericInfoPage'
import { TextInput } from 'ui/components/inputs/TextInput'
import { BrokenConnection } from 'ui/svg/BrokenConnection'
import { Spacer, Typo } from 'ui/theme'

export const DeeplinkImporter: React.FC = () => {
  const [url, setUrl] = React.useState('')
  const { navigate } = useNavigation<UseNavigationType>()
  const handleDeeplinkUrl = useDeeplinkUrlHandler()
  const resolveLink = () => {
    if (url.length > 0) {
      resolveHandler(handleDeeplinkUrl, true)({ url })
    }
  }

  return (
    <GenericInfoPage icon={BrokenConnection} title="" spacingMatrix={{ afterIcon: 1 }}>
      <StyledTitle1 color={ColorsEnum.WHITE}>{t`Accès aux liens`}</StyledTitle1>
      <Spacer.Column numberOfSpaces={4} />
      <Explanation
        color={
          ColorsEnum.WHITE
        }>{t`Pour copier ton lien, ouvre l'e-mail que tu as reçu, appuie sur le bouton ou le lien pendant environ 3 secondes, sélectionne l'option "Copier le lien" et clique sur le bouton "Importer le lien"`}</Explanation>
      <Spacer.Column numberOfSpaces={12} />
      <TextInput placeholder={t`Colle ton lien ici ...`} value={url} onChangeText={setUrl} />
      <Spacer.Column numberOfSpaces={8} />
      <ButtonPrimaryWhite title="Importer le lien" onPress={resolveLink} testIdSuffix="import" />
      <Spacer.Column numberOfSpaces={4} />
      <ButtonTertiaryWhite
        title={t`Accéder aux offres`}
        onPress={() => navigate('Home')}
        testIdSuffix="to-offers"
      />
    </GenericInfoPage>
  )
}

const StyledTitle1 = styled(Typo.Title1)({
  textAlign: 'center',
  padding: 0,
  margin: 0,
})

const Explanation = styled(Typo.Body)({
  textAlign: 'center',
})