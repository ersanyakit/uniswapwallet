import React from 'react'
import { AnimatedText } from 'src/components/text/AnimatedText'
import { render } from 'src/test/test-utils'

describe(AnimatedText, () => {
  it('renders without error', () => {
    const tree = render(<AnimatedText text={{ value: 'Rendered' }} />)

    expect(tree).toMatchInlineSnapshot(`
      <TextInput
        allowFontScaling={true}
        animatedProps={
          {
            "text": "Rendered",
          }
        }
        editable={false}
        maxFontSizeMultiplier={1.4}
        style={
          [
            [
              {},
            ],
          ]
        }
        underlineColorAndroid="transparent"
        value="Rendered"
      />
    `)
  })
})
