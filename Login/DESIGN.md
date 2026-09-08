---
name: Bloom Budget
colors:
  surface: '#fcf8ff'
  surface-dim: '#ddd8e3'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2fc'
  surface-container: '#f1ecf6'
  surface-container-high: '#ebe6f1'
  surface-container-highest: '#e5e1eb'
  on-surface: '#1c1b22'
  on-surface-variant: '#5b4043'
  inverse-surface: '#312f37'
  inverse-on-surface: '#f4eff9'
  outline: '#8f6f73'
  outline-variant: '#e3bdc1'
  surface-tint: '#bd0047'
  primary: '#b80045'
  on-primary: '#ffffff'
  primary-container: '#de245b'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb2bc'
  secondary: '#ad2c4f'
  on-secondary: '#ffffff'
  secondary-container: '#fd6989'
  on-secondary-container: '#6b0027'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9dd'
  primary-fixed-dim: '#ffb2bc'
  on-primary-fixed: '#400012'
  on-primary-fixed-variant: '#910034'
  secondary-fixed: '#ffd9dd'
  secondary-fixed-dim: '#ffb2bd'
  on-secondary-fixed: '#400014'
  on-secondary-fixed-variant: '#8c1038'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#fcf8ff'
  on-background: '#1c1b22'
  surface-variant: '#e5e1eb'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-numeric:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.02em
  label-card:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-pill:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 2.5rem
  gutter-mobile: 1rem
  margin-mobile: 1.25rem
  gutter-tablet: 1.5rem
  margin-tablet: 2rem
---

## Brand & Style

This design system delivers an editorial, chic, and reassuring approach to personal finance management. Rooted in tactile minimalism and warm digital craft, it reinterprets personal accounting from a clinical chore into a ritual of clarity, self-investment, and calm.

The target demographic consists of design-conscious professionals, lifestyle curators, and modern digital natives who value visual elegance alongside financial intelligence. The interface evokes peace, confidence, and deliberate control—delivering an atmosphere reminiscent of an upscale boutique or luxury wellness journal rather than an intimidating spreadsheet.

Stylistically, the system merges warm minimalism with soft tactile physics and restrained glassmorphism. Interfaces rely on generous negative space, sculpted pill shapes, luminous micro-shadows, and porcelain-tinted surface stacks that ground floating financial cards with tangible, physical presence.

## Colors

The color architecture is built around radiant rose accents grounded by warm porcelain whites in light mode, with an alternate midnight obsidian spectrum for dark environments.

### Palette Roles
- **Primary (`#FF4071`)**: Saturated coral-rose used for key actionable triggers, primary callouts, and key data indicators.
- **Secondary (`#FF6B8B`)**: Soft blossom pink serving as a secondary visual layer, radial gradient highlights, and decorative badge fills.
- **Tertiary (`#10B981`)**: Lucid emerald allocated strictly for positive liquidity states, inflow markers, and growth velocity metrics.
- **Negative / Expense (`#E11D48`)**: High-contrast berry-rose for expense line items and debit signals.
- **Neutral Core (`#121118`)**: Deep plum-tinted obsidian establishing high-contrast typographic hierarchy and obsidian card backdrops.

### Surface Tiers & Translucency
- **Canvas Base**: `#FFF5F7` in light mode; `#121118` in dark mode.
- **Elevated Surfaces**: Pure `#FFFFFF` with 4% rose-tinted border diffusion in light; `#1E1B26` with 1px `#2A2435` stroke in dark.
- **Glass Overlays**: White with 70% opacity (`rgba(255, 255, 255, 0.7)`) backed by a 20px blur for modals and floating control docks; dark mode leverages `rgba(30, 27, 38, 0.75)`.

## Typography

Typographic hierarchy rests on a deliberate pairing: **Plus Jakarta Sans** delivers warmth, approachability, and geometric precision across body and headlines, while **JetBrains Mono** provides technical clarity for currency values, credit card masks, timestamps, and balance figures.

- **Primary Balance Figures**: Leverage `display-lg` with tabular lining numbers to prevent layout shift during updates.
- **Cardholder Details & Counters**: Use `label-card` in full uppercase with expanded letter-spacing (`0.08em`) to mirror luxury debit cards.
- **Section Headers & Metric Identifiers**: Utilize `headline-sm` with subtle letter-tracking tightening (`-0.01em`) to maintain an editorial tone.

## Layout & Spacing

The layout philosophy follows a mobile-first fluid columnar grid anchored by standardized touch ergonomics.

### Screen Geometry
- **Mobile (<640px)**: 4-column layout with `1.25rem` (`20px`) screen boundary margins and `1rem` column gutters. All dynamic content cards conform strictly to the safe interior margins.
- **Tablet / Large Handhelds (640px–1024px)**: 8-column layout with `2rem` screen margins. Finance metrics reflow from vertically stacked cards to a 2-column modular split.
- **Max Content Constraint**: Constrained on wider viewports to `480px` for mobile web containment or `840px` when utilizing split dashboard panels.

### Rhythm & Vertical Cadence
Vertical spacing strictly adheres to multiples of `4px` and `8px`. Dense financial line-item lists leverage `space-sm` (`12px`) separation, while macroscopic balance modules are isolated with `space-2xl` (`32px`) top and bottom breathing room to sustain an uncluttered, high-end feel.

## Elevation & Depth

Elevation is articulated through translucent surface fills, layered physical cards, and rose-tinted ambient micro-shadows rather than generic gray drop shadows.

### Elevation Levels
- **Level 0 (Base Canvas)**: Flat substrate (`#FFF5F7` or `#121118`).
- **Level 1 (Tonal Cards & Tiles)**: Resting layer with an ultra-soft dual shadow:
  `box-shadow: 0 4px 20px -2px rgba(255, 64, 113, 0.06), 0 1px 3px 0 rgba(18, 17, 24, 0.03);`
  Enclosed by a subtle boundary line: `1px solid rgba(255, 107, 139, 0.12)`.
- **Level 2 (Interactive Floating Elements & Wallets)**:
  `box-shadow: 0 12px 32px -4px rgba(255, 64, 113, 0.12), 0 4px 8px -2px rgba(18, 17, 24, 0.04);`
- **Level 3 (Modal Sheets & Floating Command Bars)**: Frosted glass panel with `backdrop-filter: blur(24px)`, coupled with:
  `box-shadow: 0 20px 48px -6px rgba(18, 17, 24, 0.16);`

### Dark Mode Adaptations
In midnight mode, drop shadows are suppressed in favor of internal luminance: cards employ a gradient edge stroke (`linear-gradient(135deg, rgba(255, 107, 139, 0.25), rgba(255, 255, 255, 0.02))`) and a faint back-projected plum ambient glow (`0 0 40px rgba(255, 64, 113, 0.08)`).

## Shapes

This design system uses a sculpted rounded aesthetic designed to feel organic, friendly, and ergonomically soft in the hand.

- **Primary Cards & Wallets**: Rounded using standard container radii (`1.25rem` to `1.5rem` / `20px–24px`).
- **Action Chips & Badges**: Fully pill-shaped (`9999px`) to emphasize interactability and contrast against rectangular balance modules.
- **Input Fields**: Standardized at `0.875rem` (`14px`) radius to balance modern softness with structural typing boundaries.
- **Nested Inner Surfaces**: Children within cards must calculate radius via `R_inner = R_outer - padding` to guarantee parallel visual flow.

## Components

### Buttons
- **Primary CTA**: Full pill shape (`rounded-full`), height `52px`. Rich gradient fill (`linear-gradient(135deg, #FF6B8B 0%, #FF4071 100%)`), crisp white text (`Plus Jakarta Sans`, 600 weight), accompanied by a soft rose floor shadow.
- **Secondary Ghost**: Translucent petal background (`rgba(255, 64, 113, 0.08)`), text `#FF4071`, height `48px`. Hover or tap triggers an increase to 14% opacity.

### Chips & Wallet Filters
- Pill-shaped tags with `height: 32px`, horizontal padding of `16px`.
- Inactive state: Porcelain surface with `1px solid rgba(255, 107, 139, 0.15)` and muted obsidian text.
- Active state: Saturated rose pill background with pure white typography and an inset micro-glow.

### Transaction Lists
- Row heights configured to `68px` with consistent vertical spacing.
- Category icons utilize a `44px` circular or softly rounded squircle with pastel tinted category backdrops (e.g., emerald for income, soft lilac for lifestyle, peach for culinary).
- Counterparty name is set in `headline-sm`, subtitle/date in `body-sm`, and financial value in `label-numeric` aligned right.

### Input Fields
- Enclosed containers with a resting background of `#FFFFFF` (or `#1E1B26` dark).
- Border: `1.5px solid rgba(255, 107, 139, 0.2)`. Focus transitions border to solid `#FF4071` with an outer focus ring: `0 0 0 4px rgba(255, 64, 113, 0.15)`.
- Currency prefix symbols utilize `JetBrains Mono` at 50% opacity.

### Cards & Wallets
- **Virtual Card**: Multi-layered aspect-ratio container (`1.58:1`), `24px` radius, utilizing obsidian mesh gradients with embedded neon rose specular lighting. Features embossed-style silver foil badges and formatted card groupings using `label-card`.
- **Spending Metric Card**: Porcelain tile with a 4px vertical progress track featuring vibrant pink-to-emerald gradient fills and subtle glass badge overlays.