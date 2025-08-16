import React from 'react'

export function TypographyDemo() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-heading1 font-playfair text-charcoal-800">
          Heading 1 - Playfair Display 48px Bold
        </h1>
        <h2 className="text-heading2 font-playfair text-charcoal-700">
          Heading 2 - Playfair Display 32px Semi-Bold
        </h2>
        <p className="text-body font-lato text-charcoal-600">
          This is body text using Lato 18px regular. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at leo nec magna tempor posuere. Sed euismod, nunc vel tincidunt lacinia, nisl nisl aliquam nisl, vel aliquam nisl nisl vel nisl.
        </p>
        <blockquote className="text-quote font-lato">
          &ldquo;This is quote text using Lato 20px italic in soft grey #555. Take a moment where you are right now. Can you feel your feet on the ground?&rdquo;
        </blockquote>
      </div>

      <div className="space-y-4">
        <h2 className="heading-section">Component Classes Demo</h2>
        <p className="body-paragraph">
          This paragraph uses the body-paragraph component class for consistent styling across the site.
        </p>
        <div className="quote-pullout">
          This is a quote pullout component with soft green background and border styling for visual emphasis.
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-heading2 font-playfair text-charcoal-700">Font Family Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-charcoal-200 rounded-lg">
            <h3 className="font-playfair text-xl font-semibold mb-2">Playfair Display</h3>
            <p className="font-playfair text-lg">The quick brown fox jumps over the lazy dog.</p>
            <p className="font-playfair text-base italic">This font is used for headings and elegant text.</p>
          </div>
          <div className="p-4 border border-charcoal-200 rounded-lg">
            <h3 className="font-lato text-xl font-semibold mb-2">Lato</h3>
            <p className="font-lato text-lg">The quick brown fox jumps over the lazy dog.</p>
            <p className="font-lato text-base italic">This font is used for body text and quotes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
