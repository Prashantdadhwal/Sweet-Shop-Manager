# Sweet Shop Management System - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern e-commerce platforms (Shopify, Etsy) for the customer-facing experience and productivity tools (Linear, Notion) for admin interfaces. This dual approach balances delightful product discovery with efficient inventory management.

**Key Principles:**
- Product-first visual hierarchy emphasizing sweet imagery
- Clear role-based interface differentiation (user vs admin)
- Trustworthy, appetizing presentation that drives purchases
- Efficient admin workflows for inventory management

## Typography System

**Font Families** (via Google Fonts):
- Primary: 'Inter' (400, 500, 600, 700) - UI elements, body text, admin interfaces
- Display: 'Playfair Display' (600, 700) - Hero headlines, sweet names

**Hierarchy:**
- Hero Headline: 3xl-5xl (Playfair Display, 700)
- Page Titles: 2xl-3xl (Inter, 700)
- Sweet Names: xl-2xl (Playfair Display, 600)
- Section Headers: lg-xl (Inter, 600)
- Body Text: base (Inter, 400)
- Labels/Metadata: sm (Inter, 500)
- Fine Print: xs (Inter, 400)

## Layout System

**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-24
- Card gaps: gap-6 to gap-8
- Form field spacing: space-y-4 to space-y-6

**Container Strategy:**
- Full-width hero: w-full with max-w-7xl inner container
- Content sections: max-w-6xl mx-auto
- Admin panels: max-w-7xl with side navigation
- Forms: max-w-md centered for auth, max-w-2xl for admin forms

## Component Library

### Authentication Pages (Login/Register)

**Layout**: Centered card on soft gradient background
- Card: max-w-md, p-8, rounded-2xl with subtle shadow
- Logo/branding at top
- Form fields with generous spacing (space-y-6)
- Primary CTA button full-width
- Footer link to alternate action ("Don't have an account?")

**Form Inputs:**
- Label above input (text-sm, font-medium)
- Input field: p-3, rounded-lg, border
- Focus states with ring treatment
- Error messages below field (text-sm)

### User Dashboard - Hero Section

**Layout**: Full-width hero with appetizing sweet shop imagery
- Height: 60vh on desktop, 50vh on mobile
- Centered headline and tagline overlay
- Search bar prominently placed (max-w-2xl, centered)
- Subtle dark overlay (bg-black/40) for text readability
- Buttons with backdrop-blur-md background treatment

### User Dashboard - Sweet Grid

**Product Card Design** (inspired by Shopify/Etsy):
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Card structure: rounded-xl, overflow-hidden, hover lift effect (translate-y)
- Image container: aspect-square, object-cover
- Content padding: p-4 to p-6
- Sweet name: text-lg font-semibold (Playfair Display)
- Category badge: Small pill (px-3 py-1, rounded-full, text-xs)
- Price: text-xl font-bold
- Stock indicator: text-sm with icon
- Purchase button: Full-width, rounded-lg, p-3

**Search & Filter Bar:**
- Sticky top bar (sticky top-0, z-10)
- Flex layout with search input and filter dropdowns
- Search: Flexible width with icon prefix
- Filters: Category dropdown, price range sliders
- Clear filters button when active

### Admin Dashboard

**Navigation**: Side navigation panel
- Fixed left sidebar (w-64)
- Logo at top
- Navigation items with icons (Heroicons)
- Active state indicator (left border accent)
- Logout at bottom

**Main Content Area:**
- Stats cards row at top: grid-cols-1 md:grid-cols-3 lg:grid-cols-4
- Each stat card: p-6, rounded-xl, icon + label + large number
- Sweet management table below stats
- Action buttons (Add Sweet) in top-right header

**Sweet Management Table:**
- Responsive table with alternating row treatment
- Columns: Image (small thumbnail), Name, Category, Price, Quantity, Actions
- Action buttons: Icon buttons for Edit/Delete/Restock
- Mobile: Convert to stacked cards on small screens

**Add/Edit Sweet Form:**
- Two-column layout on desktop (lg:grid-cols-2)
- Image upload zone: Large dropzone (border-dashed, h-48) with preview
- Form fields: Full-width within columns
- Text inputs and selects with consistent styling
- Rich textarea for description (h-32)
- Action buttons: Cancel (secondary) + Save (primary) in footer

### Shared Components

**Navigation Bar** (User & Admin):
- Sticky header (sticky top-0, z-50)
- Logo left, navigation center, user menu right
- User menu: Avatar/name with dropdown (profile, logout)
- Mobile: Hamburger menu

**Buttons:**
- Primary: px-6 py-3, rounded-lg, font-medium, transition
- Secondary: Outlined variant with border
- Icon buttons: p-2, rounded-lg for compact actions
- Disabled state: Reduced opacity, no hover

**Modals/Overlays:**
- Centered overlay (fixed inset-0)
- Modal container: max-w-lg to max-w-2xl, rounded-2xl, p-6
- Header with title and close button
- Content area with appropriate padding
- Footer with action buttons (right-aligned)

**Notifications:**
- Toast notifications (fixed top-4 right-4)
- Success/error variants with icons
- Auto-dismiss after 4 seconds
- Slide-in animation

## Icons

**Library**: Heroicons (via CDN)
- Shopping cart, search, user, settings icons
- Plus/minus for inventory
- Check/X for success/error states
- Trash, pencil for admin actions

## Images

**Hero Section**: Large, high-quality image of colorful assorted sweets in a shop display or artistic arrangement. Should evoke appetite and delight. Position: Full-width background with centered text overlay.

**Product Images**: Square aspect ratio (1:1) images for each sweet. Should be well-lit, vibrant, and appetizing on clean backgrounds.

**Empty States**: Simple illustrations for "No sweets available" or "No results found" scenarios.

## Animations

**Minimal, purposeful animations:**
- Card hover lift (transform translate-y-1)
- Button press effect (scale-95)
- Modal fade-in
- Toast slide-in from right
- Loading spinners for async actions

**No scroll-triggered animations or complex motion graphics.**

## Responsive Behavior

- Mobile-first approach
- Navigation: Hamburger menu < 768px
- Product grid: 1 column < 640px, 2 columns < 1024px, 3-4 columns >= 1024px
- Admin sidebar: Collapse to overlay on mobile
- Forms: Single column on mobile, two-column on desktop where appropriate
- Tables: Convert to stacked cards on mobile

This design creates an inviting, delightful shopping experience for users while providing administrators with clean, efficient tools for inventory management.