# Tailwind CSS Configuration

This project uses **Tailwind CSS v4** with custom color scales for the Territory Slicer application.

## Installation

Tailwind CSS v4 is already installed and configured. The following packages are included:

- `tailwindcss@4.1.18` - The latest version of Tailwind CSS
- `@tailwindcss/postcss` - PostCSS plugin for Tailwind v4
- `autoprefixer` - Automatically adds vendor prefixes
- `postcss` - CSS transformation tool

## Configuration Files

### `postcss.config.js`

PostCSS configuration for Tailwind CSS v4:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### `src/index.css`

The main CSS file with Tailwind directives and custom theme:

- Uses `@import "tailwindcss"` for Tailwind v4
- Defines custom colors in `@theme` block
- Includes base application styles

## Custom Color Scale

### 5-Band Fairness Colors

Custom color scale for visualizing fairness scores:

| Band | Score Range | Color | Tailwind Class | Hex Value |
|------|------------|-------|----------------|-----------|
| **Excellent** | 94+ | Green | `bg-fairness-excellent` | #10b981 |
| **Good** | 88-93 | Light Green | `bg-fairness-good` | #84cc16 |
| **Fair** | 82-87 | Yellow | `bg-fairness-fair` | #eab308 |
| **Poor** | 75-81 | Orange | `bg-fairness-poor` | #f97316 |
| **Very Poor** | <75 | Red | `bg-fairness-very-poor` | #ef4444 |

### Color Variants

Each fairness color includes light and dark variants:

```css
--color-fairness-excellent: #10b981
--color-fairness-excellent-light: #34d399
--color-fairness-excellent-dark: #059669

--color-fairness-good: #84cc16
--color-fairness-good-light: #a3e635
--color-fairness-good-dark: #65a30d

--color-fairness-fair: #eab308
--color-fairness-fair-light: #facc15
--color-fairness-fair-dark: #ca8a04

--color-fairness-poor: #f97316
--color-fairness-poor-light: #fb923c
--color-fairness-poor-dark: #ea580c

--color-fairness-very-poor: #ef4444
--color-fairness-very-poor-light: #f87171
--color-fairness-very-poor-dark: #dc2626
```

### Primary Brand Colors

A full primary color scale (50-950) is also available for general UI elements:

```css
--color-primary-50: #f0f9ff
--color-primary-100: #e0f2fe
--color-primary-200: #bae6fd
--color-primary-300: #7dd3fc
--color-primary-400: #38bdf8
--color-primary-500: #0ea5e9
--color-primary-600: #0284c7
--color-primary-700: #0369a1
--color-primary-800: #075985
--color-primary-900: #0c4a6e
--color-primary-950: #082f49
```

## Usage Examples

### Background Colors

```jsx
<div className="bg-fairness-excellent">Excellent</div>
<div className="bg-fairness-good">Good</div>
<div className="bg-fairness-fair">Fair</div>
<div className="bg-fairness-poor">Poor</div>
<div className="bg-fairness-very-poor">Very Poor</div>
```

### Text Colors

```jsx
<span className="text-fairness-excellent">Excellent</span>
<span className="text-fairness-good">Good</span>
<span className="text-fairness-fair">Fair</span>
<span className="text-fairness-poor">Poor</span>
<span className="text-fairness-very-poor">Very Poor</span>
```

### Border Colors

```jsx
<div className="border border-fairness-excellent">Excellent</div>
<div className="border-2 border-fairness-poor">Poor</div>
```

### Complete Example

```jsx
function ScoreBadge({ score }) {
  const getBandClass = (score) => {
    if (score >= 94) return 'bg-fairness-excellent'
    if (score >= 88) return 'bg-fairness-good'
    if (score >= 82) return 'bg-fairness-fair'
    if (score >= 75) return 'bg-fairness-poor'
    return 'bg-fairness-very-poor'
  }

  return (
    <div className={`${getBandClass(score)} text-white px-4 py-2 rounded-lg font-bold`}>
      Score: {score}
    </div>
  )
}
```

## Demo Component

A demo component is available at `src/components/FairnessColorDemo.tsx` that showcases all the fairness colors. You can import and use it:

```jsx
import FairnessColorDemo from './components/FairnessColorDemo'

function App() {
  return <FairnessColorDemo />
}
```

## Development

### Start Dev Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tailwind v4 Notes

Tailwind CSS v4 introduces several changes:

1. **CSS-based configuration**: Theme customization is done directly in CSS using the `@theme` directive
2. **No JavaScript config file**: The traditional `tailwind.config.js` is not used
3. **Import syntax**: Use `@import "tailwindcss"` instead of `@tailwind` directives
4. **Better performance**: Faster builds and smaller bundle sizes
5. **Native CSS variables**: All custom properties are CSS variables

## Adding More Custom Colors

To add more custom colors, edit `src/index.css` and add them within the `@theme` block:

```css
@theme {
  /* Your existing colors */
  
  /* Add new colors */
  --color-custom-name: #hexvalue;
}
```

Then use them like any other Tailwind color:

```jsx
<div className="bg-custom-name">Content</div>
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Tailwind CSS v4 Alpha Docs](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [Vite Documentation](https://vitejs.dev)
