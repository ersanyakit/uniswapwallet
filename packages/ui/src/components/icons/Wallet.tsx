import type { IconProps } from '@tamagui/helpers-icon'
import React, { memo } from 'react'
import { Path, Svg } from 'react-native-svg'
import { getTokenValue, isWeb, useTheme } from 'tamagui'

const Icon: React.FC<IconProps> = (props) => {
  // isWeb currentColor to maintain backwards compat a bit better, on native uses theme color
  const {
    color: colorProp = isWeb ? 'currentColor' : undefined,
    size: sizeProp = '$true',
    strokeWidth: strokeWidthProp,
    ...restProps
  } = props
  const theme = useTheme()

  const size = typeof sizeProp === 'string' ? getTokenValue(sizeProp, 'size') : sizeProp

  const strokeWidth =
    typeof strokeWidthProp === 'string' ? getTokenValue(strokeWidthProp, 'size') : strokeWidthProp

  const color = colorProp ?? theme.color.get()

  const svgProps = {
    ...restProps,
    size,
    strokeWidth,
    color,
  }

  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size} {...svgProps}>
      <Path
        clipRule="evenodd"
        d="M4 3.99902C2.34315 3.99902 1 5.34217 1 6.99902V17.999C1 19.6559 2.34315 20.999 4 20.999H20C21.6569 20.999 23 19.6559 23 17.999V6.99902C23 5.34217 21.6569 3.99902 20 3.99902H4ZM3 17.999V10.999C3 10.4475 3.44812 9.99902 4.00115 9.99902H19.9989C20.5519 9.99902 21 10.4475 21 10.999V17.999C21 18.5513 20.5523 18.999 20 18.999H4C3.44772 18.999 3 18.5513 3 17.999ZM19.9989 7.99902C20.3498 7.99902 20.6868 8.05931 21 8.17011V6.99902C21 6.44674 20.5523 5.99902 20 5.99902H4C3.44772 5.99902 3 6.44674 3 6.99902V8.17011C3.31318 8.05931 3.65018 7.99902 4.00115 7.99902H19.9989Z"
        fill={color}
        fillRule="evenodd"
      />
      <Path
        d="M3 11.999V13.999H7.35465C7.9611 15.5239 9.50565 16.8562 12 16.8562C13.271 16.8562 14.3391 16.5093 15.1735 15.8493C15.9093 15.2674 16.3172 14.5566 16.5574 13.999H21V11.999H16C15.4477 11.999 14.9935 12.5275 14.7645 13.1018C14.4438 13.9062 13.789 14.8562 12 14.8562C10.29 14.8562 9.48213 13.9883 9.1936 13.2092C8.96575 12.594 8.49905 11.999 7.91447 11.999H3Z"
        fill={color}
      />
    </Svg>
  )
}

Icon.displayName = 'Wallet'

export const Wallet = memo<IconProps>(Icon)
