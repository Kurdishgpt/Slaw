# Discord Bot Dashboard - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Fluent Design + Discord-inspired)

**Justification:** This is a utility-focused dashboard application requiring clear data presentation, efficient navigation, and reliable patterns. Users need to quickly access bot statistics, manage API keys, and view leaderboards. We'll combine Fluent Design's data-density principles with Discord's modern, gaming-friendly aesthetic.

**Key Design Principles:**
- Clarity over decoration: Information hierarchy drives all decisions
- Scannable data: Users should parse statistics and leaderboards instantly
- Gaming-adjacent aesthetic: Subtle nods to Discord's brand without mimicking
- Admin confidence: Professional polish that inspires trust

---

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) - for UI, body text, and data
- Monospace: JetBrains Mono (Google Fonts) - for API keys, code snippets

**Hierarchy:**
- H1: text-4xl font-bold (Dashboard page titles)
- H2: text-2xl font-semibold (Section headers)
- H3: text-xl font-semibold (Card titles, subsection headers)
- Body Large: text-base font-medium (Primary stats, emphasis text)
- Body: text-sm (Standard UI text, table content)
- Body Small: text-xs (Metadata, timestamps, helper text)
- Monospace: text-sm font-mono (API keys, technical data)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Micro spacing (between related elements): p-2, gap-2
- Component internal padding: p-4, p-6
- Section spacing: p-8, mb-12
- Page-level margins: p-16, py-20

**Grid Structure:**
- Dashboard uses sidebar + main content layout
- Sidebar: Fixed width at 280px (w-70), sticky positioning
- Main content: Flexible width with max-w-7xl container
- Cards grid: 2-3 columns on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Stats display: 4 columns for key metrics (grid-cols-2 lg:grid-cols-4)

**Responsive Breakpoints:**
- Mobile: Single column, collapsible sidebar becomes drawer
- Tablet (md:): 2-column grids, persistent sidebar
- Desktop (lg:+): Full multi-column layouts, expanded sidebar

---

## Component Library

### Navigation

**Sidebar Navigation:**
- Logo/branding at top with bot name
- Navigation links with icons (Heroicons) and labels
- Active state: Distinct visual treatment with icon emphasis
- Sections: Dashboard, Leaderboard, API Keys, Settings, Documentation
- Footer area: User profile/logout, bot status indicator

**Top Bar:**
- Page title on left
- Quick actions on right (refresh data, export, settings)
- Breadcrumb navigation for nested pages
- Real-time status indicators (bot online/offline, last sync time)

### Dashboard Cards

**Stat Cards (4-column grid):**
- Large number display (text-3xl font-bold)
- Label underneath (text-sm)
- Icon in top-right corner
- Subtle hover effect (slight elevation change)
- Cards: Total Users, Total Points, Active Today, Links Posted

**Feature Cards:**
- Title with icon
- Supporting description text
- Primary metric or data visualization
- Secondary action button if applicable
- Examples: Recent Activity, Top Contributors, Cooldown Status

### Data Display

**Leaderboard Table:**
- Rank number (with medal icons for top 3)
- User avatar/name column
- Points column (right-aligned numbers)
- Last activity timestamp
- Status badge (active/cooldown)
- Zebra striping for rows
- Fixed header on scroll
- 10 entries per page with pagination

**User Activity Feed:**
- Timeline-style vertical list
- User info + action taken
- Points earned indicator
- Timestamp (relative time, e.g., "2 hours ago")
- Link type badge (paste/server)
- Max 5 recent items, with "View All" link

### Forms & Inputs

**API Key Management:**
- Generate key button (prominent CTA)
- Active keys display table with columns: Key (masked, click to reveal), Created, Last Used, Actions
- Copy-to-clipboard button with success feedback
- Revoke button (destructive action, requires confirmation)
- Key format: Monospace font, letter-spacing for readability

**Search/Filter Controls:**
- Search bar: w-full with icon prefix, placeholder text
- Filter dropdowns: Multi-select for user status, time ranges
- Date range picker for historical data
- Clear filters action

### Interactive Elements

**Buttons:**
- Primary: Solid background, medium weight text, rounded-lg, px-6 py-3
- Secondary: Outline style, same sizing
- Small actions: px-4 py-2, text-sm
- Icon buttons: Square, p-2, icon centered
- Destructive: Distinct treatment for delete/revoke actions

**Badges/Pills:**
- Status indicators: rounded-full, px-3 py-1, text-xs font-medium
- Types: Active, Cooldown, Offline, Premium
- Point values: Small pill format inline with text

**Modals/Dialogs:**
- Centered overlay with backdrop
- Max width: max-w-2xl
- Header with title and close button
- Content area with appropriate padding (p-8)
- Footer with action buttons (right-aligned)
- Usage: API key generation, confirm actions, detailed stats

### Notifications

**Toast Messages:**
- Top-right corner positioning
- Success: "API key copied to clipboard"
- Error: "Failed to generate API key"
- Info: "Bot reconnected"
- Auto-dismiss after 5 seconds with progress bar

**Inline Alerts:**
- Full-width information boxes
- Icon + message + optional action
- Types: Info (bot status), Warning (approaching limit), Error (connection issues)

---

## Page-Specific Layouts

### Dashboard (Home)
- Stats overview (4-card grid at top)
- Two-column below: Recent Activity (left) + Quick Actions (right)
- Leaderboard preview (top 5 users)
- Bot health/status card

### Leaderboard
- Filter controls at top
- Full leaderboard table
- Export leaderboard button
- Time period selector (24h, 7d, 30d, All time)

### API Keys
- Hero section: "Export Your Data" heading + description
- API documentation card with endpoint examples
- Active keys table
- Generate new key CTA (prominent)
- Code snippets showing API usage examples

### Settings
- Two-column form layout
- Bot configuration options (target channel, cooldown duration, max points)
- Save changes button (sticky footer on scroll)
- Danger zone section at bottom (reset all points, delete bot data)

---

## Animations & Interactions

**Minimal, Purposeful Animation:**
- Card hover: Subtle elevation increase (transition-all duration-200)
- Button states: Scale transform on active (scale-95)
- Data refresh: Subtle pulse animation on stat cards
- Loading states: Skeleton screens for tables, spinner for small actions
- No scroll-triggered animations
- Smooth transitions between pages (fade effect)

---

## Images

**Hero Images:**
No large hero image - this is a dashboard application prioritizing information density.

**Supporting Graphics:**
- Bot avatar/logo: Display in sidebar header and empty states
- User avatars: 32px circular thumbnails in leaderboard and activity feed
- Empty state illustrations: Simple, minimal SVG graphics when no data exists (e.g., "No API keys generated yet")
- Icon set: Heroicons throughout for consistent visual language

**Placement:**
- Sidebar header: Bot branding/logo (48px height)
- Empty states: Centered illustration (max 200px) with supporting text below
- User profile areas: Avatar thumbnails inline with text

---

## Accessibility & Interaction

- High contrast text ratios throughout
- Keyboard navigation for all interactive elements
- Focus indicators on all focusable elements (ring-2 offset-2)
- Screen reader labels for icon-only buttons
- ARIA labels for data tables and complex components
- Tooltips on hover for condensed information
- Consistent tab order following visual hierarchy