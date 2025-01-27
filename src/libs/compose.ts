import { ComponentType } from 'react'

interface ComponentEnhancer {
  (component: ComponentType<any>): ComponentType<any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Same implementaion as in `recompose` library : https://github.com/acdlite/recompose/blob/master/src/packages/recompose/compose.js
// eslint-disable-next-line @typescript-eslint/ban-types
export function compose(...functions: Function[]): ComponentEnhancer {
  return functions.reduce(
    (a, b) => (...args: any[]) => a(b(...args)), // eslint-disable-line @typescript-eslint/no-explicit-any
    (arg: any) => arg // eslint-disable-line @typescript-eslint/no-explicit-any
  ) as ComponentEnhancer
}
