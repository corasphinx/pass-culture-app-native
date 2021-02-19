import { NavigationContainer, Theme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import CodePush from 'react-native-code-push'

import { PrivacyPolicy } from 'features/firstLogin/PrivacyPolicy/PrivacyPolicy'
import { analytics } from 'libs/analytics'
import { useCodePush } from 'libs/codepush/CodePushProvider'
import { useHideSplashScreen } from 'libs/splashscreen'
import { storage } from 'libs/storage'
import { ColorsEnum } from 'ui/theme'

import { navigationRef } from '../navigationRef'
import { onNavigationStateChange } from '../services'

import routes from './routes'
import { RootStackParamList, Route } from './types'

export const RootStack = createStackNavigator<RootStackParamList>()

const theme = { colors: { background: ColorsEnum.WHITE } } as Theme

export function wrapRoute(route: Route) {
  if (route.hoc) {
    route.component = route.hoc(route.component)
  }

  return route
}

const screens = routes
  .map(wrapRoute)
  .map((route: Route) => (
    <RootStack.Screen
      key={route.name}
      name={route.name}
      component={route.component}
      options={route.options}
    />
  ))

type InitialRouteName = 'TabNavigator' | 'FirstTutorial' | undefined

export const RootNavigator: React.FC = () => {
  const [initialRouteName, setInitialRouteName] = useState<InitialRouteName>()
  const { status } = useCodePush()

  const isAppReadyToStart = !!initialRouteName && status === CodePush.SyncStatus.UP_TO_DATE

  const { isSplashScreenHidden } = useHideSplashScreen({
    shouldHideSplashScreen: isAppReadyToStart,
  })

  useEffect(() => {
    storage.readObject('has_seen_tutorials').then((hasSeenTutorials) => {
      const routeName = hasSeenTutorials ? 'TabNavigator' : 'FirstTutorial'
      setInitialRouteName(routeName)
      triggerInitialRouteNameAnalytics(routeName)
    })
  }, [])

  if (!isAppReadyToStart) return null
  return (
    <NavigationContainer onStateChange={onNavigationStateChange} ref={navigationRef} theme={theme}>
      <RootStack.Navigator
        initialRouteName={initialRouteName}
        headerMode="screen"
        screenOptions={{ headerShown: false }}>
        {screens}
      </RootStack.Navigator>
      {/* The components below are those for which we do not want 
      their rendering to happen while the splash is displayed. */}
      {isSplashScreenHidden && <PrivacyPolicy />}
    </NavigationContainer>
  )
}

function triggerInitialRouteNameAnalytics(routeName: InitialRouteName) {
  if (!routeName) {
    return
  }
  if (routeName === 'TabNavigator') {
    analytics.logScreenView('Home')
  } else {
    analytics.logScreenView(routeName)
  }
}
