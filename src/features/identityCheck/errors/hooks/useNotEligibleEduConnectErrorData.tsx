import React, { ReactElement } from 'react'
import { TextStyle } from 'react-native'
import { ColorsEnum } from 'theme/colors'
import { getSpacing } from 'ui/utils'

import { Clock } from 'ui/svg/icons/Clock'

type NotEligibleEduConnectErrorData = {
  Icon: () => ReactElement
  title: string
  description: string
  titleAlignment?: Exclude<TextStyle['textAlign'], 'auto'>
  descriptionAlignment?: Exclude<TextStyle['textAlign'], 'auto'>
}
const UserAgeNotValid: NotEligibleEduConnectErrorData = {
  Icon: () => <Clock color={ColorsEnum.WHITE} size={getSpacing(30)} />,
  title: `Tu ne fais pas partie de la phase de test`,
  description: `Le pass Culture pour les jeunes de 15 à 17 ans est actuellement en phase de test auprès de 22 établissements scolaires des académies de Rennes et de Versailles.

Encore un peu de patience... On se donne rendez-vous en janvier 2022 : nous reviendrons vers toi dès que le pass te sera accessible.

En attendant, tu peux tout de même découvrir l'application mais sans pouvoir réserver les offres.`,
  titleAlignment: 'left',
  descriptionAlignment: 'left',
}

const InvalidAgeFromEduConnect: NotEligibleEduConnectErrorData = {
  Icon: () => <Clock color={ColorsEnum.WHITE} size={getSpacing(30)} />,
  title: `Oh Non!`,
  description: `La date de naissance enregistrée dans ÉduConnect semble indiquer que tu n'as pas l'âge requis pour obtenir l'aide du Gouvernement.

S’il y a une erreur sur ta date de naissance, contacte ton établissement pour modifier ton profil ÉduConnect.`,
  titleAlignment: 'center',
  descriptionAlignment: 'center',
}

type NotEligibleEduConnectErrorMessage =
  | 'InvalidAgeFromEduConnect'
  | 'UserAlreadyBeneficiary'
  | 'UserAgeNotValid'

export function useNotEligibleEduConnectErrorData(
  message: NotEligibleEduConnectErrorMessage | string
) {
  switch (message) {
    case 'InvalidAgeFromEduConnect':
      return InvalidAgeFromEduConnect

    default:
      return UserAgeNotValid
  }
}
