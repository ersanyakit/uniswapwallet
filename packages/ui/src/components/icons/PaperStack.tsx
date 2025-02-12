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
        d="M5.29469 10.272C3.83536 10.0146 3.23479 9.15664 3.49212 7.69731L4.38747 2.62L4.3847 2.61597L1.85882 3.06067C0.399486 3.32 -0.200644 4.1793 0.058689 5.63863L1.0888 11.476C1.3408 12.9353 2.2001 13.5353 3.65944 13.276L8.03737 12.5053C9.05937 12.32 9.66751 11.8387 9.83017 11.068L9.82545 11.06C9.77345 11.0526 9.72678 11.0527 9.67278 11.0433L5.29469 10.272Z"
        fill={color}
        opacity="0.2"
      />
      <Path
        clipRule="evenodd"
        d="M7.09549 0.0578836L11.4728 0.829897C12.9321 1.08723 13.5328 1.9459 13.2748 3.40456L12.2454 9.24054C11.9974 10.6459 11.1862 11.2472 9.82351 11.0599C9.80056 11.0566 9.77864 11.0548 9.75667 11.053C9.72888 11.0507 9.70101 11.0484 9.67084 11.0432L5.29405 10.2712C3.83472 10.0139 3.23415 9.15589 3.49148 7.69656L4.38683 2.6192L4.52078 1.86054C4.77811 0.401203 5.63682 -0.19945 7.09549 0.0578836ZM10.4856 6.42927C10.5149 6.4346 10.5441 6.43659 10.5728 6.43659C10.8115 6.43659 11.0222 6.26592 11.0642 6.02392C11.1128 5.75192 10.9309 5.49261 10.6589 5.44461L6.28228 4.6726C6.01295 4.6246 5.75084 4.80595 5.7035 5.07795C5.65484 5.34995 5.83694 5.60926 6.10894 5.65726L10.4856 6.42927ZM11.1262 3.26993C11.3982 3.31793 11.5796 3.57727 11.5316 3.84927C11.489 4.09194 11.2783 4.26262 11.0403 4.26195C11.0116 4.26195 10.9822 4.25992 10.9529 4.25459L6.57623 3.48262C6.30423 3.43462 6.12295 3.17527 6.17095 2.90327C6.21829 2.63194 6.48023 2.44991 6.74957 2.49791L11.1262 3.26993ZM8.63091 7.35192C8.90291 7.39992 9.08419 7.65926 9.03619 7.93126C8.99352 8.17393 8.78281 8.34461 8.54481 8.34394C8.51615 8.34394 8.48691 8.34195 8.45757 8.33662L5.72157 7.85395C5.44957 7.80595 5.2683 7.54661 5.3163 7.27461C5.36363 7.00327 5.62424 6.82059 5.89491 6.86925L8.63091 7.35192Z"
        fill={color}
        fillRule="evenodd"
      />
    </Svg>
  )
}

Icon.displayName = 'PaperStack'

export const PaperStack = memo<IconProps>(Icon)
