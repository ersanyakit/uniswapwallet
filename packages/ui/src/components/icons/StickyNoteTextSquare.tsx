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
    <Svg fill="none" height={size} viewBox="0 0 14 14" width={size} {...svgProps}>
      <Path
        d="M10.6599 9.25H13.165C13.12 9.3175 13.0675 9.36999 13.0075 9.42999L9.42999 13.0075C9.36999 13.0675 9.3175 13.12 9.25 13.165V10.66C9.25 9.88 9.87991 9.25 10.6599 9.25ZM13.75 2.7775V7.63748C13.75 7.80248 13.7349 7.9675 13.6974 8.125H10.6599C9.25741 8.125 8.125 9.2575 8.125 10.66V13.6975C7.9675 13.735 7.80257 13.75 7.63757 13.75H2.78491C1.08991 13.75 0.25 12.9025 0.25 11.215V2.7775C0.25 1.09 1.08991 0.25 2.78491 0.25H11.2151C12.9101 0.25 13.75 1.09 13.75 2.7775ZM7.5625 8.5C7.5625 8.1895 7.3105 7.9375 7 7.9375H4C3.6895 7.9375 3.4375 8.1895 3.4375 8.5C3.4375 8.8105 3.6895 9.0625 4 9.0625H7C7.3105 9.0625 7.5625 8.8105 7.5625 8.5ZM10.5625 5.125C10.5625 4.8145 10.3105 4.5625 10 4.5625H4C3.6895 4.5625 3.4375 4.8145 3.4375 5.125C3.4375 5.4355 3.6895 5.6875 4 5.6875H10C10.3105 5.6875 10.5625 5.4355 10.5625 5.125Z"
        fill={color}
      />
    </Svg>
  )
}

Icon.displayName = 'StickyNoteTextSquare'

export const StickyNoteTextSquare = memo<IconProps>(Icon)
