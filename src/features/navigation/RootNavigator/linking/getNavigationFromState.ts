import { NavigationState } from '@react-navigation/native'

import { NavigationResultState, RootNavigateParams } from 'features/navigation/RootNavigator'

export function getNavigationFromState(
  state: NavigationResultState | NavigationState
): RootNavigateParams {
  if (!state || !state.routes) {
    return ['PageNotFound', undefined]
  }
  const { routes, index } = state
  const currentRouteIndex = index ?? routes.length - 1
  const route = routes[currentRouteIndex]
  let params = route.params
  if (route.state) {
    params = getNavigationParamsFromState(route.state)
  }
  return [route.name, params] as RootNavigateParams
}

type NestedNavigationParams = {
  screen: RootNavigateParams[0]
  params: RootNavigateParams[1]
}

function getNavigationParamsFromState(
  state: NavigationResultState | NavigationState
): NestedNavigationParams | undefined {
  if (!state || !state.routes) {
    return undefined
  }
  const { routes, index } = state
  const currentRouteIndex = index ?? routes.length - 1
  const route = routes[currentRouteIndex]
  let params = route.params
  if (route.state) {
    params = getNavigationParamsFromState(route.state)
  }
  return { screen: route.name, params } as NestedNavigationParams
}
