import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

import { ColorsEnum } from 'ui/theme'

import { IconInterface } from './types'

export const ExternalLinkSquare: React.FunctionComponent<IconInterface> = ({
  size = 32,
  color = ColorsEnum.BLACK,
  testID,
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" testID={testID}>
    <Path
      fill={color}
      d="M10 4C6.68629 4 4 6.68629 4 10V38C4 41.3137 6.68629 44 10 44H38C41.3137 44 44 41.3137 44 38V10C44 6.68629 41.3137 4 38 4H10ZM23.5017 15.5163C23.5017 14.6792 24.1804 14.0001 25.0181 14.0001H31.5606C32.9073 14.0001 34 15.0932 34 16.4394V22.9821C34 23.8193 33.3213 24.4983 32.4836 24.4983C31.6459 24.4983 30.9672 23.8193 30.9672 22.9821V19.1768L16.5887 33.5558C15.9965 34.148 15.0363 34.148 14.4441 33.5558C13.852 32.9637 13.852 32.0038 14.4441 31.4117L28.8227 17.0326H25.0181C24.1804 17.0326 23.5017 16.3535 23.5017 15.5163ZM15.0367 32.0039L30.0075 17.0326H30.0072L15.0365 32.0038C14.7715 32.2689 14.7715 32.6986 15.0365 32.9636C15.0539 32.981 15.072 32.9973 15.0907 33.0124C15.072 32.9973 15.054 32.9811 15.0367 32.9638C14.7716 32.6987 14.7716 32.269 15.0367 32.0039ZM33.1623 22.9821C33.1623 23.2691 32.9842 23.5145 32.7325 23.6137C32.9841 23.5144 33.1622 23.2691 33.1622 22.9821V16.8715L33.1623 16.8714V22.9821Z"
    />
  </Svg>
)