---
name: Pitch Power
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#3e4a41'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#6e7a70'
  outline-variant: '#bdcabe'
  surface-tint: '#006d40'
  primary: '#006b3f'
  on-primary: '#ffffff'
  primary-container: '#008751'
  on-primary-container: '#fdfff9'
  inverse-primary: '#70db9d'
  secondary: '#7a590c'
  on-secondary: '#ffffff'
  secondary-container: '#fed17b'
  on-secondary-container: '#78580b'
  tertiary: '#196a44'
  on-tertiary: '#ffffff'
  tertiary-container: '#37835b'
  on-tertiary-container: '#fbfff9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8df8b7'
  primary-fixed-dim: '#70db9d'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#00522f'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#ecc06c'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#a5f3c3'
  tertiary-fixed-dim: '#8ad7a9'
  on-tertiary-fixed: '#002111'
  on-tertiary-fixed-variant: '#005231'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 72px
    fontWeight: '400'
    lineHeight: 80px
  headline-xl:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
  headline-lg:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 34px
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  section-gap: 80px
  stack-sm: 12px
  stack-md: 24px
  grid-margin: 32px
  grid-gutter: 24px
---

## Brand & Style

This design system is built for a soccer club’s community-driven crowdfunding initiative. The aesthetic is **High-Contrast / Bold**, leaning into the energy of professional sports while maintaining the transparency and trust required for financial contributions. 

The visual narrative centers on the "Green and Gold" legacy. It utilizes large, aggressive typography and a high-energy layout to evoke a sense of stadium excitement. The interface is designed to make supporters feel like they are part of a winning team, using sharp edges and dynamic angles to mirror the speed and precision of the sport.

The primary emotional goal is to move the user from a passive fan to an active "club builder."

## Colors

The palette is derived directly from the club’s identity.
- **Primary Green (#008751):** Represents the pitch and the club's core identity. Used for primary actions and key branding.
- **Gold (#C9A050):** Symbolizes excellence, victory, and the value of community investment. Used for highlights, achievements, and "donate" calls-to-action.
- **Deep Emerald (#005C38):** Provides depth for headers and footer backgrounds, ensuring a premium feel.
- **Neutral Charcoal (#1A1A1A):** Used for primary text and high-contrast containers to ensure maximum legibility and a modern "athletic" edge.

## Typography

The typography system uses a "Power and Precision" pairing.
- **Headlines:** Uses **Anton** for its tall, condensed, and impactful presence. All headlines should be set in uppercase to mimic stadium signage and sports broadcasting graphics.
- **Body & Interface:** Uses **Be Vietnam Pro** for its contemporary and approachable feel. It provides high readability for campaign descriptions and financial details.
- **Hierarchy:** Use wide letter-spacing for uppercase labels to create a professional, structured look. Use substantial contrast between headline sizes to guide the user quickly to the "why" and "how much."

## Layout & Spacing

This design system employs a **Fluid Grid** model to accommodate the data-heavy nature of crowdfunding (leaderboards, contribution tiers, progress bars).

- **Desktop:** 12-column grid with a 1200px max-width container.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.

Spacing follows an 8px rhythmic scale. Use "Section Gaps" (80px+) liberally to allow the bold typography breathing room, preventing the interface from feeling cluttered. For contribution forms, use a tighter 12px stack to keep related inputs visually grouped.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Bold Borders** rather than traditional soft shadows. This reinforces the "Brutalist-Athletic" aesthetic.

- **Primary Surfaces:** Pure white (#FFFFFF) for maximum contrast against green accents.
- **Tier 2 Surfaces:** Light grey (#F4F4F4) to separate secondary content blocks.
- **Depth:** Instead of shadows, use 2px solid borders in Green or Gold to highlight active states or featured contribution tiers.
- **Overlay:** Use high-opacity (90%) Deep Emerald backgrounds for modals to maintain club branding even when focus is diverted.

## Shapes

The shape language is **Soft (0.25rem)**. While the brand is aggressive and bold, slight rounding on corners ensures the UI feels modern and trustworthy rather than harsh.

- **Buttons & Inputs:** Use the standard 0.25rem (4px) radius.
- **Progress Bars:** Use fully rounded (pill-shaped) ends to provide a visual contrast to the otherwise geometric layout.
- **Featured Cards:** Use the `rounded-lg` (8px) token to give campaign highlights a slightly distinct, more approachable container.

## Components

### Buttons
- **Primary:** Background: Gold (#C9A050); Text: Neutral (#1A1A1A); Font: Label-Bold (Uppercase). High-impact for "Donate Now."
- **Secondary:** Background: Transparent; Border: 2px Green (#008751); Text: Green. Used for "Learn More" or "View Campaign."

### Progress Bars
- **Track:** Light Grey (#E0E0E0).
- **Fill:** Primary Green (#008751) with a Gold (#C9A050) "glow" effect at the leading edge to signify momentum.

### Contribution Cards
- High-contrast containers with a 1px Neutral border. 
- On hover, the border thickens to 3px Green.
- Use a large Anton-based display for the dollar/euro amount to make tiers feel significant.

### Leaderboards
- Clean, list-based layout with zebra-striping (F4F4F4).
- Use Gold medals or badges for top-tier contributors to gamify the experience.

### Inputs
- Solid 1px borders. Focused state uses a 2px Green border. Label text should always be visible above the field in Label-Bold.