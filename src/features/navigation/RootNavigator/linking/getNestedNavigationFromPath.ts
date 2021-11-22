import { RootNavigateParams } from 'features/navigation/RootNavigator'
import { linking } from 'features/navigation/RootNavigator/linking'
import { getNestedNavigationFromState } from 'features/navigation/RootNavigator/linking/getNestedNavigationFromState'

export function getNestedNavigationFromPath(path: string): RootNavigateParams {
  const state = linking.getStateFromPath(path, linking.config)
  return getNestedNavigationFromState(state)
}
