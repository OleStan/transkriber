# Stitch UI Redesign Plan
**Date:** 2026-03-28
**Stitch Project:** 14564387568629644632 — "Transcriber Design Specification (PRD)"
**Design Theme:** High-End Editorial Transcription ("The Digital Archivist")

---

## Design System Overview

This is a complete design system overhaul. The Stitch design moves from the current teal/blue scheme to a **deep navy + lavender/violet** editorial aesthetic.

### Color Token Migration

| Token | Current | Stitch |
|---|---|---|
| App background | `#111b22` | `#0b1326` |
| Surface-container-low | `#1a2632` | `#131b2e` |
| Surface-container | hardcoded | `#171f33` |
| Surface-container-high | `#243947` | `#222a3d` |
| Surface-container-highest | — | `#2d3449` |
| Surface-container-lowest | `#0d1822` | `#060e20` |
| Surface-bright | — | `#31394d` |
| **Primary accent** | `#1993e5` (blue) | `#d0bcff` (lavender) |
| Primary-container | — | `#a078ff` |
| On-surface (text) | `white` | `#dae2fd` |
| On-surface-variant | `#93b3c8` | `#cbc3d7` |
| Tertiary (active/processing) | `#1993e5` | `#ffb869` (amber) |
| Error | `#ff6b6b` | `#ffb4ab` |
| Outline-variant | `#2d4a5c` | `#494454` |
| Outline | — | `#958ea0` |
| Secondary-container (speaker) | — | `#513e7f` |
| On-secondary-container | — | `#c3adf7` |

### Typography Migration

| Role | Current | Stitch |
|---|---|---|
| Headlines/titles | system font | **Manrope** (Google Font) |
| Transcript body text | system font | **Newsreader** (serif, Google Font) |
| UI / labels / controls | system font | **Inter** (Google Font) |
| Timestamps/metadata | system font | **Monospace** |

### Key Design Rules

1. **No-Line Rule**: No 1px solid borders for section separation. Use background shifts only. Exception: `outline-variant/10` (very faint) allowed for card outlines.
2. **Gradient Primary CTAs**: `linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)` for primary action buttons.
3. **Input style**: Bottom-border only (`border-b-2`), no box border. Focus state: border changes to primary color.
4. **Status pills**: Pill-shaped (`border-radius: 9999px`), colored dot (1.5px) + uppercase `tracking-wider` text.
5. **Hover actions**: Table row actions hidden by default, appear on hover (`opacity-0 group-hover:opacity-100`).
6. **AI Summary panel**: Background `tertiary-container/10` = `rgba(202, 128, 30, 0.1)`.

---

## Implementation Tasks

### T1 — Global: MUI Theme + Google Fonts [HIGH]

**Files:**
- `app/javascript/react/main.tsx` — add Google Fonts `<link>` or import
- `app/javascript/react/theme.ts` (create) — MUI theme with new color tokens
- `app/views/layouts/application.html.erb` — add Google Fonts link

**Changes:**
1. Add Google Fonts to HTML head:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet"/>
   ```
2. Create `app/javascript/react/theme.ts` with MUI `createTheme()`:
   ```typescript
   export const DS = {
     bg: '#0b1326',
     surfaceLowest: '#060e20',
     surfaceLow: '#131b2e',
     surface: '#171f33',
     surfaceHigh: '#222a3d',
     surfaceHighest: '#2d3449',
     surfaceBright: '#31394d',
     primary: '#d0bcff',
     primaryContainer: '#a078ff',
     onPrimary: '#3c0091',
     onSurface: '#dae2fd',
     onSurfaceVariant: '#cbc3d7',
     tertiary: '#ffb869',
     tertiaryContainer: 'rgba(202, 128, 30, 0.1)',
     error: '#ffb4ab',
     errorContainer: '#93000a',
     outlineVariant: '#494454',
     outline: '#958ea0',
     secondaryContainer: '#513e7f',
     onSecondaryContainer: '#c3adf7',
     primaryGradient: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
   } as const;
   ```
3. Apply `fontFamily: { headline: 'Manrope', body: 'Newsreader', label: 'Inter' }` in theme

**Priority:** Do this first — all other tasks depend on it.

---

### T2 — NavBar [HIGH]

**File:** `app/javascript/react/components/layout/NavBar.tsx` (rewrite)

**Current state:** Minimal stub — MUI Joy Sheet with 3 text links (Home, About, Contact). No icons, no avatar.

**Design (from Stitch):**
```
[Transcriber logo] [Home] [Transcripts] [Settings] --- [🔔] [?] [avatar]
```
- Fixed top, full-width, height 64px, background `#0b1326`
- Logo: "Transcriber", Manrope bold, `#d0bcff`, 20px
- Nav links (hidden on mobile): active has 2px bottom border in `#d0bcff`, inactive is `slate-400` → hover white
- Right side: notifications icon button, help icon button, user avatar circle (32px, `surface-container-highest` bg, ring `primary/20`)
- Icons: `NotificationsOutlined`, `HelpOutlineOutlined` (MUI icons), `slate-400` → hover white, hover bg `#171f33`, rounded

```tsx
// Key sx values:
// container: { position: 'fixed', top: 0, width: '100%', zIndex: 50, bgcolor: '#0b1326', height: '64px', px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
// logo: { color: '#d0bcff', fontFamily: 'Manrope', fontWeight: 800, fontSize: '20px' }
// active link: { color: '#d0bcff', borderBottom: '2px solid #d0bcff', pb: '4px' }
// inactive link: { color: '#94a3b8', '&:hover': { color: 'white' } }
// icon button: { color: '#94a3b8', '&:hover': { color: 'white', bgcolor: '#171f33' }, borderRadius: '50%', p: 1 }
// avatar: { width: 32, height: 32, borderRadius: '50%', bgcolor: '#222a3d', ring: '2px solid rgba(208,188,255,0.2)' }
```

---

### T3 — Home Page [HIGH]

**Files:**
- `app/javascript/react/components/home/Home.tsx`
- `app/javascript/react/components/home/QuickAddFile/QuickAddFileOrUrl.tsx`
- `app/javascript/react/components/home/SidebarRecentActivity.tsx`

**Changes:**

**Home.tsx:**
- Add hero section above the upload card:
  ```tsx
  <Typography sx={{ fontFamily: 'Manrope', fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
    The Digital Archivist
  </Typography>
  <Typography sx={{ fontFamily: 'Newsreader', fontSize: '1.25rem', color: '#cbc3d7', fontStyle: 'italic', maxWidth: '480px' }}>
    Transform your recordings into editorial-grade transcripts.
  </Typography>
  ```
- Below upload card, add 2 feature stat cards:
  - Card 1: `bg: '#171f33'` — "99.2% Accuracy" + description
  - Card 2: `bg: '#222a3d'` — "Real-time Drafts" + description
- Right sidebar: add **Workspace Usage** card below Recent Activity:
  - Progress bar: `bg: '#060e20'`, fill: primary gradient
  - "Upgrade Plan" button: `bg: '#513e7f'`, text: `#c3adf7`

**QuickAddFileOrUrl.tsx (upload card):**
- Container: `bgcolor: '#131b2e'`, `borderRadius: '12px'`, `border: '1px solid rgba(73, 68, 84, 0.1)'`
- Tabs: active tab has `borderBottom: '2px solid #d0bcff'`, text `#d0bcff`; inactive: `#94a3b8`
- URL input: `bgcolor: '#060e20'`, `border: '2px solid rgba(73,68,84,0.3)'`, focus border `#d0bcff`, no box-shadow ring
- CTA button: **gradient** `linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)`, text `#3c0091`, `borderRadius: '12px'`
- Below input: 3 feature chips (Video Hubs, Podcasts, Direct Links) in `surface-container-highest/20`
- AI Speaker bar: `tertiaryContainer/5` background, `#ffb869` icon+text

**SidebarRecentActivity.tsx:**
- Container: `bgcolor: '#131b2e'`, `borderRadius: '12px'`, `border: '1px solid rgba(73,68,84,0.1)'`
- Status dots: amber (`#ffb869`) pulsing for in-progress, green (`#22c55e`) for completed, `#ffb4ab` for error
- Failed item row: `bgcolor: 'rgba(147, 0, 10, 0.1)'`, error text in `#ffb4ab`
- "View all activity" link: `#d0bcff`, uppercase, tiny tracking, border-top separator

---

### T4 — Transcriptions List [HIGH]

**Files:**
- `app/javascript/react/components/transcription/Transcriptions.tsx`
- `app/javascript/react/components/transcription/transcriptionsTable/TranscriptionsTable.tsx`
- `app/javascript/react/components/transcription/transcriptionsTable/TranscriptionsTableBase.tsx`
- `app/javascript/react/components/transcription/transcriptionsTable/StyledTranscriptionsTable.tsx`

**Changes:**

**Page header (Transcriptions.tsx):**
- Title: "Transcripts" — Manrope 800, 2.5rem, `#dae2fd`
- Subtitle: "The archive of your digital narratives." — Newsreader italic, 1.125rem, `#cbc3d7`
- Search toggle: Title/Content pill toggle — `bgcolor: '#131b2e'`, active: `bgcolor: '#d0bcff'`, text `#3c0091`

**Search bar:**
- Full-width input with search icon at left
- Style: `bgcolor: '#060e20'`, `border: 'none'`, `borderBottom: '2px solid rgba(73,68,84,0.2)'`, focus: `borderBottomColor: '#d0bcff'`
- Font: Newsreader, 1.125rem, placeholder `rgba(149,142,160,0.5)`
- `borderRadius: '12px 12px 0 0'`

**Table container:**
- `bgcolor: '#131b2e'`, `borderRadius: '16px'`, `overflow: 'hidden'`
- Header row: `bgcolor: 'rgba(34,42,61,0.5)'`, text `#958ea0`, 10px, `letterSpacing: '0.2em'`, uppercase, bold
- Row separator: `borderBottom: '1px solid rgba(73,68,84,0.1)'` (not standard MUI divider)
- Row hover: `bgcolor: '#171f33'`

**Status pills (update everywhere):**
```tsx
// Completed: bg rgba(16,185,129,0.1), text #34d399, dot bg #34d399
// Failed: bg rgba(255,180,171,0.1), text #ffb4ab, dot bg #ffb4ab
// Processing/In-progress: bg rgba(255,184,105,0.1), text #ffb869, dot bg #ffb869, pulse animation
// Pending: bg rgba(149,142,160,0.1), text #958ea0, dot bg #958ea0
```

**Type icon column:**
- Container: `w: 40px, h: 40px, borderRadius: '8px', bgcolor: '#2d3449'`
- Audio: `#d0bcff` color icon; Video: same; Error: `#ffb4ab` icon

**Actions (hidden, appear on row hover):**
- `opacity: 0, '.group:hover &': { opacity: 1 }` pattern
- Download, Share, Delete icon buttons; `p: 1, borderRadius: '8px'`, hover bg `#2d3449`

**FAB button (new — add to Transcriptions.tsx):**
```tsx
<Fab
  sx={{
    position: 'fixed', bottom: { xs: 96, md: 48 }, right: { xs: 24, md: 48 },
    background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
    color: '#3c0091',
    boxShadow: '0 20px 40px rgba(6, 14, 32, 0.4)',
    '&:hover': { transform: 'scale(1.05)' },
  }}
>
  <AddIcon />
</Fab>
```

**Pagination:**
- Container: `bgcolor: 'rgba(34,42,61,0.3)'`, `borderTop: '1px solid rgba(73,68,84,0.1)'`
- Active page: `bgcolor: '#d0bcff'`, text `#3c0091`
- Inactive: `bgcolor: 'transparent'`, hover `#2d3449`

---

### T5 — Transcription Detail [HIGH]

**Files:**
- `app/javascript/react/components/transcription/transcriptionShow/TranscriptionShow.tsx`
- `app/javascript/react/components/transcription/transcriptionShow/TranscriptionSummary.tsx`
- `app/javascript/react/components/transcription/transcriptionShow/TranscriptionShowTranscription.tsx`

**Changes:**

**Breadcrumb (add above title):**
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
  <Typography sx={{ color: '#958ea0', fontSize: '12px', cursor: 'pointer', '&:hover': { color: 'white' } }}>Library</Typography>
  <ChevronRightIcon sx={{ color: '#958ea0', fontSize: '16px' }} />
  <Typography sx={{ color: '#958ea0', fontSize: '12px' }}>Q3 Product Strategy</Typography>
</Box>
```

**Title:**
- Font: Manrope 800, 2rem, `#dae2fd`, `letterSpacing: '-0.02em'`

**Action buttons (top right):**
- Edit, Download: ghost border — `border: '1px solid rgba(73,68,84,0.15)'`, text `#d0bcff`, hover `bgcolor: '#171f33'`, `borderRadius: '12px'`
- Share: gradient fill button

**Audio Player card:**
- `bgcolor: '#131b2e'`, `borderRadius: '16px'`, `border: '1px solid rgba(73,68,84,0.05)'`
- Play button: gradient circle, 48px
- Waveform: stylized bars with primary color (currently just Plyr — keep Plyr but restyle container)
- Speed selector: `bgcolor: '#2d3449'`, `borderRadius: '12px'`

**AI Summary card (update TranscriptionSummary.tsx):**
- Header icon: `bgcolor: 'rgba(202,128,30,0.1)'`, icon `#ffb869`
- Title: "AI Intel Summary", Manrope bold
- Layout: **2-column grid** on desktop — left: "Executive Overview" (italic Newsreader), right: "Action Items" (checkboxes with `check_circle` icon in `#d0bcff`)
- Update `SummaryData` keys to match: `overview` stays, add `actionItems` display with MUI icons

**Transcript segments (TranscriptionShowTranscription.tsx):**
- Layout per segment: `{ display: 'flex', gap: 3 }`
- Timestamp: `{ width: '96px', flexShrink: 0, fontFamily: 'monospace', fontSize: '12px', color: '#958ea0', cursor: 'pointer', '&:hover': { color: '#d0bcff' } }`
- Speaker badge (if speaker data exists): pill `{ bgcolor: '#513e7f', color: '#c3adf7', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '9999px', px: 1.5, py: 0.5, mb: 1.5, display: 'inline-flex' }`
- Segment text: `{ fontFamily: 'Newsreader', fontSize: '1.25rem', lineHeight: 1.6, color: '#dae2fd' }`
- Segment gap: `{ mb: 6 }` between segments (generous vertical space)

**Right sidebar — "Insight Engine" AI Chat (new — post-MVP, just add placeholder for now):**
- Can be stubbed as a collapsible panel showing "Coming soon" or hidden entirely

---

### T6 — Settings Page [MEDIUM]

**File:** `app/javascript/react/components/settings/Settings.tsx`

**Changes:**

**Add left sidebar nav:**
```tsx
// Sidebar: 256px wide, sticky top-16, bgcolor: '#131b2e', border-right: rgba(49,57,77,0.15)
// Nav items: Profile, Security, Team (disabled), Usage (disabled), Billing (disabled), API (disabled), Webhooks (disabled)
// Active: bgcolor: 'rgba(208,188,255,0.1)', color: '#d0bcff', fontWeight: 700
// Inactive: color: '#94a3b8', hover color: '#dae2fd', hover bgcolor: '#171f33'
// "Upgrade Plan" gradient button at bottom
```

**Input fields (update to bottom-border style):**
```tsx
// Remove outlined variant; use standard variant + custom sx:
// { bgcolor: '#060e20', border: 'none', borderBottom: '2px solid rgba(73,68,84,0.3)', borderRadius: 0,
//   '&:focus-within': { borderBottomColor: '#d0bcff' }, py: 1.5, px: 0 }
```

**Password strength indicator (add to password field):**
```tsx
// 4-segment bar: h=4px, segments fill with #d0bcff based on strength
// Label: "STRENGTH" (uppercase, 10px, tracking) + strength label (Very Weak/Strong/etc.)
```

**Section container:**
- `bgcolor: '#131b2e'`, `borderRadius: '12px'`, `border: '1px solid rgba(73,68,84,0.1)'`

**Save/Update buttons:**
- Profile Save: `bgcolor: '#222a3d'`, `border: '1px solid rgba(73,68,84,0.2)'`, text `#d0bcff`
- Password Update: **gradient** button

---

### T7 — Login / Auth Pages [MEDIUM]

**Files:**
- `app/javascript/react/components/auth/Login.tsx`
- `app/javascript/react/components/auth/Signup.tsx`

**Changes:**

**Background:**
```tsx
// Page bg: #0b1326 with radial gradients:
// radial-gradient(circle at top right, rgba(208, 188, 255, 0.08), transparent 40%)
// radial-gradient(circle at bottom left, rgba(160, 120, 255, 0.05), transparent 40%)
```

**Header:** Centered, blurred bg `rgba(2,6,14,0.5)` + backdrop-blur, logo "Transcriber" or "Digital Archivist"

**Card:**
- `bgcolor: '#171f33'`, `borderRadius: '12px'`, `p: { xs: 4, md: 6 }`
- Decorative blur circle: `position: absolute`, top-right, `bgcolor: 'rgba(208,188,255,0.05)'`, `borderRadius: '50%'`, `filter: 'blur(48px)'`

**Form inputs (bottom-border only):**
- Label: `{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#958ea0' }`
- Input: `{ bgcolor: '#060e20', border: 'none', borderBottom: '2px solid transparent', '&:focus-within': { borderBottomColor: '#d0bcff' }, borderRadius: 0 }`

**Submit button:** Full-width gradient, Manrope bold, 16px, py: 2, `borderRadius: '8px'`

**Divider:** "Or secure access with" — `{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#958ea0' }`

**Google OAuth button:** `bgcolor: '#222a3d'`, `border: '1px solid rgba(73,68,84,0.2)'`, hover `bgcolor: '#31394d'`, 48px height

---

### T8 — Mobile Bottom Navigation (New Component) [MEDIUM]

**File:** `app/javascript/react/components/layout/MobileBottomNav.tsx` (create)

**Design:**
```
| Home | Library | Search | Settings |
```
- Fixed bottom, full-width, `bgcolor: 'rgba(11,19,38,0.8)'`, `backdropFilter: 'blur(20px)'`
- Border-top: `1px solid rgba(49,57,77,0.2)`
- Box shadow: `0 -10px 30px rgba(0,0,0,0.5)`
- `borderRadius: '16px 16px 0 0'`
- Each tab: icon (Material Symbols) + label 10px uppercase
- Active: `color: '#d0bcff'`, `bgcolor: 'rgba(208,188,255,0.1)'`, rounded-xl
- Inactive: `color: '#64748b'`

Add to `Home.tsx`, `Transcriptions.tsx`, `TranscriptionShow.tsx`, `Settings.tsx` (render only on mobile via `sx={{ display: { xs: 'flex', md: 'none' } }}`)

---

### T9 — Update All Status Badge Components [HIGH]

Status pills are used across Home, Transcriptions, and TranscriptionShow. Create a shared `StatusBadge` component:

**File:** `app/javascript/react/components/shared/StatusBadge.tsx` (create)

```tsx
// Props: status: string
// Returns pill with: dot + uppercase label
// Colors per status:
// completed: { bg: 'rgba(16,185,129,0.1)', color: '#34d399', dot: '#34d399' }
// in_progress/transcribing/processing/uploading: { bg: 'rgba(255,184,105,0.1)', color: '#ffb869', dot: '#ffb869', pulse: true }
// failed: { bg: 'rgba(255,180,171,0.1)', color: '#ffb4ab', dot: '#ffb4ab' }
// pending/cancelled: { bg: 'rgba(149,142,160,0.1)', color: '#958ea0', dot: '#958ea0' }
// Style: { display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }
```

---

## Implementation Order

1. **T1** — Global theme tokens + Google Fonts (foundation)
2. **T9** — StatusBadge shared component
3. **T2** — NavBar rewrite
4. **T3** — Home page hero + upload card + sidebar
5. **T4** — Transcriptions list + table
6. **T5** — Transcription detail
7. **T6** — Settings
8. **T7** — Auth pages
9. **T8** — Mobile bottom nav

---

## What to Preserve (Don't Break)

- All RTK Query data fetching logic
- All WebSocket (ActionCable) subscriptions
- Auth guards (ProtectedRoute)
- Export functionality (download menu)
- AI Summary panel logic (just restyle it)
- Edit mode / save functionality in TranscriptionShow
- All existing routes

---

## What's New vs Current

| Feature | Status |
|---|---|
| Lavender/violet color scheme | **New** — complete palette swap |
| Manrope + Newsreader + Inter fonts | **New** — need Google Fonts |
| Gradient primary buttons | **New** |
| Bottom-border inputs | **New** |
| Hero text on Home | **New** |
| Feature stat cards on Home | **New** |
| Workspace Usage sidebar card | **New** |
| NavBar with icons + avatar | **New** |
| Status pills with dots | Redesign of existing |
| Row hover actions in table | **New** UX pattern |
| FAB on Transcriptions | **New** |
| Breadcrumb on detail page | **New** |
| Speaker badges on segments | **New** (no speaker data yet — hide if absent) |
| Newsreader serif for transcript text | **New** |
| Monospace timestamps | **New** |
| Settings left sidebar | **New** |
| Password strength bar | **New** |
| Editorial gradient on Login | **New** |
| Mobile bottom nav | **New** |
| "Insight Engine" AI chat sidebar | **Post-MVP stub only** |
