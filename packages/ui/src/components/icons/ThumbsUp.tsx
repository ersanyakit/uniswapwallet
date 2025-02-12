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
        d="M7.40039 22.4004H4.40039C3.86996 22.4004 3.36125 22.1897 2.98618 21.8146C2.6111 21.4395 2.40039 20.9308 2.40039 20.4004V13.4004C2.40039 12.87 2.6111 12.3613 2.98618 11.9862C3.36125 11.6111 3.86996 11.4004 4.40039 11.4004H7.40039M14.4004 9.40039V5.40039C14.4004 4.60474 14.0843 3.84168 13.5217 3.27907C12.9591 2.71646 12.196 2.40039 11.4004 2.40039L7.40039 11.4004V22.4004H18.6804C19.1627 22.4058 19.6308 22.2368 19.9983 21.9244C20.3658 21.612 20.6081 21.1773 20.6804 20.7004L22.0604 11.7004C22.1039 11.4137 22.0846 11.1211 22.0037 10.8426C21.9229 10.5642 21.7825 10.3067 21.5922 10.0879C21.402 9.86912 21.1665 9.69432 20.902 9.57561C20.6375 9.45689 20.3503 9.39711 20.0604 9.40039H14.4004Z"
        stroke={color}
      />
    </Svg>
  )
}

Icon.displayName = 'ThumbsUp'

export const ThumbsUp = memo<IconProps>(Icon)
