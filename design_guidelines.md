# GIW USDC Wallet - Design Guidelines

## Core Principles
1. **Trust & Security**: Visual elements reinforce professionalism and security
2. **Data Clarity**: Financial information is scannable and understandable
3. **Purposeful Motion**: Animations confirm actions, never distract
4. **Progressive Disclosure**: Complex features revealed contextually

---

## Typography

**Fonts**:
- **Primary**: Inter (body, UI elements)
- **Accent**: Space Grotesk (large numbers, hero elements)

**Scale**:
```
Display Numbers (balances):  text-6xl/7xl, font-bold, Space Grotesk
Page Headings:               text-3xl/4xl, font-semibold
Section Headers:             text-2xl, font-semibold
Card Titles:                 text-xl, font-medium
Body:                        text-base, font-normal
Secondary:                   text-sm, font-normal
Labels:                      text-xs, font-medium, uppercase, tracking-wide
Financial Data:              font-feature-settings: 'tnum'
```

---

## Layout & Spacing

**Use Tailwind units**: 2, 4, 6, 8, 12, 16

### Dashboard Structure
```
Sidebar:          w-64, fixed, p-6 (logo), py-3 px-4 (nav items)
Main Content:     ml-64, max-w-7xl mx-auto, p-8
Page Header:      mb-8
Section Spacing:  space-y-8
```

### Auth Pages
```
Card:             max-w-md mx-auto, p-8
Vertical Padding: py-12 (mobile), py-20 (desktop)
Form Spacing:     gap-4, mt-6 (buttons)
```

### Component Spacing
```
Balance Card:     p-8 to p-12, mt-8 (actions), gap-4
Transaction Rows: py-4 px-6
Grid Cards:       grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
Chart Cards:      p-6, h-48 to h-64
```

---

## Components

### Navigation
**Sidebar**:
- Icons: 20x20px (Heroicons), mr-3
- Active state: Left border accent
- Hover: Subtle background shift

### Data Display

**Balance Card**:
```
Size:      text-5xl/6xl
Label:     text-sm, uppercase, tracking-wide
Badge:     Small trend indicator with arrow
Border:    rounded-2xl
```

**Transaction Item**:
```
Layout:    Icon (40x40px, rounded-lg) | Details | Amount
Details:   Merchant (text-base, font-medium), Date (text-sm)
Amount:    text-base, font-semibold, tabular, right-aligned
Divider:   border-b
```

**Insight Cards**:
```
Border:    rounded-xl, p-6
Icon:      24x24px header
Chart:     h-48 to h-64
Footer:    Grid 2-3 metrics, text-sm
```

**Card Display**:
```
Ratio:     1.586:1 (physical card)
Details:   Masked numbers, expiry, type badge
Treatment: Gradient backgrounds, network logos
```

### Forms

**Inputs**:
```
Size:      h-12, px-4, rounded-lg
Label:     mb-2, text-sm, font-medium
Focus:     ring-2
Error:     Border change + text-sm message mt-1
```

**PIN Entry**:
```
Boxes:     w-12 h-12, rounded-lg, gap-3
Focus:     Enhanced border + success animation
```

**Buttons**:
```
Primary/Secondary: h-12, px-6, rounded-lg, font-medium
Icon Buttons:      h-10 w-10, rounded-lg
Button Groups:     gap-3
```

### Status & Feedback

**Badges**:
```
Style:     px-3 py-1, rounded-full
Text:      text-xs, font-medium, uppercase
States:    Completed, Pending, Failed, Active
```

**Alerts**:
```
Style:     p-4, rounded-lg
Icon:      20x20px, mr-3
Close:     h-5 w-5, right-aligned
Types:     Info, Success, Warning, Error
```

**Loading**:
```
Inline Spinner:   20-24px
Full-page:        40-48px
Cards:            Skeleton screens with pulse
```

### Modals
```
Max Width:  max-w-md to max-w-2xl
Padding:    p-6 to p-8
Border:     rounded-2xl
Header:     text-2xl, font-semibold, mb-6
Actions:    Right-aligned, gap-3
```

### Charts (Chart.js/Recharts)
```
Height:     h-64 (detail), h-48 (cards)
Axis:       text-xs
Legend:     text-sm, bottom/right
Tooltips:   Interactive on hover
Progress:   h-3 to h-4, rounded-full
```

---

## Page Layouts

### Auth Pages
```
Logo:          mb-8, centered
Fields:        space-y-4
Social Login:  Grid 2-3, gap-3, mt-6
Footer:        text-sm, mt-8, centered
```

### Home Page
```
Hero:          Full-width, h-96+, gradient overlay
Features:      grid-cols-1 md:grid-cols-3, gap-8
News:          max-w-4xl mx-auto, space-y-4
CTA:           Centered, max-w-2xl
```

### Wallet Dashboard
```
Balance Card:  Top, prominent
Layout:        grid-cols-1 lg:grid-cols-3
               - Left 2 cols: Transactions, Quick actions
               - Right 1 col: Cards, Quick stats
AI Insights:   Bottom section
```

### Cards Management
```
Header:        "Add Card" button
Grid:          grid-cols-1 md:grid-cols-2 lg:grid-cols-3
Actions:       Set default per card
```

### AI Insights
```
Summary:       grid-cols-2 lg:grid-cols-4 (top)
Charts:        grid-cols-1 lg:grid-cols-2
Categories:    Full width (bottom)
Height:        Uniform per row
```

---

## Images

**Hero Section**:
- Full-width blockchain/digital finance visualization
- Height: h-96 to h-screen
- Overlay: Gradient for text readability
- CTAs: backdrop-blur-md, px-8 py-3, rounded-full

**Feature Images**:
```
Card Logos:    h-8 to h-10
USDC Logo:     h-12 to h-16 (balance card)
Empty States:  h-48, friendly illustrations
News Thumbs:   aspect-[16/9] (mobile), w-32 (desktop)
```

---

## Animations

**Core Animations** (essential only):
```
Transaction Success:  Checkmark (300ms)
Balance Update:       Number count (500ms)
Card Flip:            3D flip (400ms)
Page Transition:      Fade-in (200ms)
Data Load:            Skeleton to content (300ms)
```

**Micro-interactions**:
```
Hover:         scale-[1.02] or brightness (150ms)
Button Press:  scale-[0.98]
Toggles:       Slide (200ms)
Dropdowns:     Fade + slide (250ms)
```

**Prohibited**: Parallax, excessive hovers, background animations, auto-play carousels

---

## Accessibility

**Required**:
```
Focus:         ring-2 ring-offset-2 on all interactive elements
Touch Target:  44x44px minimum
Labels:        Always visible (not placeholder-only)
Errors:        Visual indicator + descriptive text
Keyboard:      Full support, logical tab order
Semantic:      Proper HTML, ARIA labels where needed
Contrast:      WCAG AA minimum
```

---

## Quick Reference

**Spacing Scale**: 2, 4, 6, 8, 12, 16  
**Border Radius**: rounded-lg (default), rounded-xl (cards), rounded-2xl (large cards), rounded-full (badges/pills)  
**Icons**: 20x20px (nav), 24x24px (headers), 40x40px (transactions)  
**Transitions**: 150-500ms range  
**Grid Breakpoints**: md:, lg: for responsive layouts