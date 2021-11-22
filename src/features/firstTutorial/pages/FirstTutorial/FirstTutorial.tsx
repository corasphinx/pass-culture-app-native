import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { BackHandler } from 'react-native'

import { navigateToHome } from 'features/navigation/helpers'
import { RootStackParamList } from 'features/navigation/RootNavigator'
import { linking } from 'features/navigation/RootNavigator/linking'
import { getNavigationFromState } from 'features/navigation/RootNavigator/linking/getNavigationFromState'
import { storage } from 'libs/storage'
import { GenericAchievement } from 'ui/components/achievements'

import { FirstCard } from './components/FirstCard'
import { FourthCard } from './components/FourthCard'
import { SecondCard } from './components/SecondCard'
import { ThirdCard } from './components/ThirdCard'

type Props = StackScreenProps<RootStackParamList, 'FirstTutorial'>

export function FirstTutorial({ navigation, route }: Props) {
  const { path, params } = route

  function navigateToOrinallyIntendedRoute() {
    if (path) {
      const state = linking.getStateFromPath(path, linking.config)
      const navParams = getNavigationFromState(state)
      navigation.navigate(...navParams)
    } else {
      navigateToHome()
    }
  }

  function onFirstCardBackAction() {
    if (path) {
      navigateToOrinallyIntendedRoute()
    } else if (params?.shouldCloseAppOnBackAction) {
      BackHandler.exitApp()
    }
  }

  function onSkip() {
    storage.saveObject('has_seen_tutorials', true)
    navigateToOrinallyIntendedRoute()
  }

  return (
    <GenericAchievement
      screenName="FirstTutorial"
      skip={onSkip}
      onFirstCardBackAction={onFirstCardBackAction}
      onLastCardAction={navigateToOrinallyIntendedRoute}>
      <FirstCard />
      <SecondCard />
      <ThirdCard />
      <FourthCard />
    </GenericAchievement>
  )
}
