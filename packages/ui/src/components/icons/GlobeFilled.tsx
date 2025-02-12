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
    <Svg fill="none" height={size} viewBox="0 0 16 16" width={size} {...svgProps}>
      <Path
        d="M4.12251 8.5625C4.23501 10.8725 5.01501 13.2275 6.37251 15.32C3.19251 14.615 0.770022 11.8925 0.522522 8.5625H4.12251ZM6.37251 0.679993C3.19251 1.38499 0.770022 4.1075 0.522522 7.4375H4.12251C4.23501 5.1275 5.01501 2.77249 6.37251 0.679993ZM8.15003 0.5H7.85001L7.62502 0.822495C6.20002 2.84749 5.36751 5.1725 5.24751 7.4375H10.7525C10.6325 5.1725 9.80002 2.84749 8.37502 0.822495L8.15003 0.5ZM5.24751 8.5625C5.36751 10.8275 6.20002 13.1525 7.62502 15.1775L7.85001 15.5H8.15003L8.37502 15.1775C9.80002 13.1525 10.6325 10.8275 10.7525 8.5625H5.24751ZM11.8775 8.5625C11.765 10.8725 10.985 13.2275 9.62753 15.32C12.8075 14.615 15.23 11.8925 15.4775 8.5625H11.8775ZM15.4775 7.4375C15.23 4.1075 12.8075 1.38499 9.62753 0.679993C10.985 2.77249 11.765 5.1275 11.8775 7.4375H15.4775Z"
        fill={color}
      />
    </Svg>
  )
}

Icon.displayName = 'GlobeFilled'

export const GlobeFilled = memo<IconProps>(Icon)
