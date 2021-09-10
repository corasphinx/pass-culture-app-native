import { NavigationContainer, NavigationContainerRef, Theme } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'

import { RootNavigator } from 'features/navigation/RootNavigator'
import { linking } from 'features/navigation/RootNavigator/routes'
import { useSplashScreenContext } from 'libs/splashscreen'
import { ColorsEnum } from 'ui/theme'

import { isNavigationReadyRef, navigationRef } from '../navigationRef'
import { onNavigationStateChange } from '../services'

const NAV_THEME = { colors: { background: ColorsEnum.WHITE } } as Theme

export const AppNavigationContainer = () => {
  const [isRefDefined, setIsRefDefined] = useState(false)
  const { hideSplashScreen } = useSplashScreenContext()

  useEffect(() => {
    return () => {
      /* @ts-ignore : Cannot assign to 'current' because it is a read-only property. */
      isNavigationReadyRef.current = false
    }
  }, [])

  const onReady = useCallback(() => {
    /* @ts-expect-error : Cannot assign to 'current' because it is a read-only property. */
    isNavigationReadyRef.current = true
    hideSplashScreen && hideSplashScreen()
  }, [hideSplashScreen])

  function setRef(ref: NavigationContainerRef | null) {
    if (ref) {
      /* @ts-ignore : Cannot assign to 'current' because it is a read-only property. */
      navigationRef.current = ref
      setIsRefDefined(true)
    }
  }

  return (
    <NavigationContainer
      linking={linking}
      onStateChange={onNavigationStateChange}
      ref={setRef}
      onReady={onReady}
      theme={NAV_THEME}>
      {isRefDefined ? <RootNavigator /> : null}
    </NavigationContainer>
  )
}
