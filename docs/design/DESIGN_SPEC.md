# Transcriber — Design Specification

> For the design team. Engineering implementation plan lives at `docs/superpowers/plans/2026-03-22-mvp-and-post-mvp-plan.md`.
> Last updated: 2026-03-22

---

## Design System Baseline

**Current stack:** MUI Joy + MUI Material (React)
**Theme:** Dark/light toggle (persisted). Dark is the primary/default.
**Typography:** System font stack (no custom font set yet — opportunity to define one)
**Color palette:** Not yet formally defined beyond MUI defaults
**Breakpoints:** xs < 600px | sm 600–900px | md 900–1200px | lg 1200px+

### Design Principles

1. **Speed first** — the product handles long-running jobs. Every screen must feel responsive even when work is happening in the background.
2. **Content is the UI** — the transcript text is the product. Chrome and decoration should step back.
3. **Progressive disclosure** — show the essentials first. Advanced options (diarization, export format, language) appear when relevant.
4. **Status is always visible** — users should never wonder if their file is being processed.

### Touch Targets
- Minimum 44×44px for all interactive elements (WCAG 2.1 AA)
- Input font-size minimum 16px (prevents iOS auto-zoom)

---

## Current Screens (Existing — for reference)

### Home (`/home`)
Upload widget (file or URL tab) + recent transcriptions table. Dark background, card-based layout.

### Transcriptions (`/transcriptions`)
Full list with filter bar, search, pagination. Table with status chips, file type icons, action icons.

### Transcription Detail (`/transcriptions/:id`)
Audio player (top) → transcript segments (below). Real-time progress bar while processing. Sidebar: adjustable segment size slider.

### Settings (`/settings`)
Profile card + security card. Stacked vertically. Currently non-functional (stubs).

### Login / Signup
Email+password form + Google OAuth button. Minimal layout.

---

# MVP FEATURES — Design Specs

---

## DS-M1: Settings — Profile Name Update

**Where:** `/settings` → Profile section

### Current State
The name update form exists visually but does nothing when submitted.

### What Needs Designing
No new layout needed — the form already exists. What's needed is the **interaction design for all states**:

#### States to Design

| State | Description |
|---|---|
| Default | Input pre-filled with current display name. Save button visible but disabled until value changes. |
| Dirty | User has changed the value. Save button becomes active. |
| Loading | User clicked Save. Input disabled, button shows spinner. |
| Success | Name saved. Input re-enables. Green inline confirmation: "Name updated ✓" appears for 2s then fades. |
| Error | API failed. Red inline message below input: "Failed to update. Try again." Button re-enables. |

#### Design Decisions Needed
- Does the success state use an inline message, a toast, or a field-level indicator? *(Recommendation: toast — consistent with rest of app)*
- Should the Save button be inline with the input or below it?
- Validation: what's the max character count for a display name? Show a character counter?

#### Validation Rules (from spec)
- Required field — cannot be empty
- 2–60 characters
- No special characters (letters, spaces, hyphens only)

---

## DS-M2: Settings — Password Change

**Where:** `/settings` → Security section

### Current State
Three-field form (current password, new password, confirm) exists visually but does nothing.

### What Needs Designing

#### States to Design

| State | Description |
|---|---|
| Default | All fields empty. Change Password button visible. |
| Typing (new password) | Password strength indicator appears below new password field. |
| Validation error | Red inline message under each failing field. |
| Wrong current password | After submit: red inline under "Current password" field specifically. |
| Loading | All inputs disabled. Button shows spinner. |
| Success | All inputs cleared. Toast: "Password updated successfully." |

#### Password Strength Indicator
Appears only while user is typing in the "New password" field.

```
[New Password         ]
████░░░░  Medium strength
```

- **Weak** (red bar, 25%): under 8 chars
- **Medium** (amber bar, 50%): 8+ chars, letters only
- **Strong** (green bar, 75%): 8+ chars with number
- **Very strong** (green bar, 100%): 8+ chars with number + special char

#### Show/Hide Toggle
Each password field has an eye icon on the right. Clicking toggles between `••••••` and plain text.

#### Design Decisions Needed
- Strength indicator placement: below field or inline as a tooltip?
- Should the strength label ("Medium") be text or just color-coded?

---

## DS-M3: Export Transcript (TXT / SRT / VTT)

**Where:** Two entry points — transcriptions table row + transcription detail page

### Entry Point 1 — Table Row
The Download icon button in each table row currently shows "Coming soon" toast.

**Proposed flow:** Click download icon → opens a small **popover/dropdown** anchored to the button with 3 options:

```
┌──────────────────────┐
│  📄  Plain text (.txt)│
│  🎬  Subtitles (.srt) │
│  🌐  Web captions (.vtt)│
└──────────────────────┘
```

Selecting an option immediately starts the browser file download. No modal.

**States:**
- Idle: download icon, tooltip "Download transcript"
- Dropdown open: menu anchored below/above button
- Downloading: icon button briefly shows small circular progress (300ms), then browser download begins
- Error: popover closes, toast appears: "Export failed — please try again"

### Entry Point 2 — Transcription Detail Header
The header action bar already has a DownloadIcon button that is unwired.

Same dropdown behavior as table. Button is larger (labeled "Download") on desktop, icon-only on mobile.

### Format Reference (for design understanding)
- **TXT**: plain transcript text, no timestamps. Good for reading/editing.
- **SRT**: standard subtitle file. Used with video players. Has numbered blocks + timestamps.
- **VTT**: same as SRT but for web video (HTML5 `<track>` element).

### Design Decisions Needed
- Should the dropdown show format descriptions ("for video players" etc.) or just names?
- Should disabled formats (e.g., SRT/VTT when no timestamp data) be grayed out with tooltip, or hidden?

---

## DS-M4: Recent Activity Sidebar

**Where:** Home page right sidebar (`/home`)

### Current State
Placeholder text: "(Recent transcriptions will appear here)"

### What Needs Designing

A compact list of the **5 most recent transcriptions** with quick-access links.

#### Item Layout (each row)

```
● Meeting with John           2h ago
  Completed

● Design review call          In progress
  Transcribing... 67%

● Interview Sarah             Yesterday
  Failed
```

- **Left:** Status dot (color-coded, animated pulse for in-progress)
- **Center top:** Transcription title (max ~24 chars, truncate with ellipsis)
- **Center bottom:** Status label. If in-progress, show percentage.
- **Right:** Relative time ("2h ago", "Yesterday", "3 days ago")

#### Status Colors

| Status | Color | Animation |
|---|---|---|
| Completed | Green | None |
| In progress / Transcribing | Amber/orange | Pulsing dot |
| Failed | Red | None |
| Cancelled | Gray | None |
| Pending / Queued | Light gray | None |

#### States to Design

| State | Description |
|---|---|
| Loading | 3 skeleton rows matching item height |
| Empty | Single line: "No transcriptions yet. Upload your first file ↑" (arrow points to upload widget) |
| Populated | Up to 5 items, clickable (navigates to `/transcriptions/:id`) |

#### Interactions
- Entire row is clickable — navigates to transcription detail
- No hover action buttons (keep it clean)
- "View all →" link at bottom navigates to `/transcriptions`

#### Design Decisions Needed
- Should the sidebar have a title "Recent" / "Activity" / "Recent transcriptions"?
- Should the sidebar be always visible, or collapsible on smaller desktop screens?

---

## DS-M5: Speaker Diarization

Speaker diarization identifies who is speaking in a recording. This affects multiple screens.

### Screen 1 — Upload Dialog: Diarization Toggle

**Where:** Inside the file/URL upload dialog, below the language selector.

```
┌────────────────────────────────────────┐
│  Language         [Auto-detect    ▾]   │
│                                        │
│  Identify speakers    [Toggle: OFF]    │
│  Number of speakers   [Auto-detect ▾]  │  ← only shown when toggle is ON
└────────────────────────────────────────┘
```

**States:**
- Toggle OFF (default): "Number of speakers" row hidden
- Toggle ON: "Number of speakers" dropdown appears with options: Auto-detect, 2, 3, 4, 5, 6, 7, 8+
- Tooltip on toggle: "Identifies different speakers in the recording. Adds ~30s to processing time."

### Screen 2 — Transcription Detail: Speaker Badges

When diarization data exists, each transcript segment shows a speaker badge before the text.

```
[Speaker 1]  Good morning everyone, let's get started
             with the Q2 budget review...

[Speaker 2]  Before we do, I wanted to flag the
             timeline concerns from last week...

[Speaker 1]  Sure, let's address that first.
```

**Badge design:**
- Pill shape, colored background, white text
- Each speaker gets a consistent color from a 6-color palette (repeating if more than 6 speakers)
- Label: "Speaker 1", "Speaker 2", etc. (future: allow renaming)
- Color palette suggestion: blue, purple, teal, orange, rose, green

### Screen 3 — Speaker Panel (Sidebar)

A collapsible side panel showing speaker breakdown. Toggled by a "Speakers" tab or icon button.

```
┌─────────────────────────┐
│  Speakers               │
│                         │
│  ● Speaker 1  ████ 62%  │
│    248 words             │
│                         │
│  ● Speaker 2  ██ 38%    │
│    152 words             │
└─────────────────────────┘
```

Each row: colored dot matching badge color, speaker label, talk-time percentage bar, word count.

### Screen 4 — Speaker Filter

Clicking a speaker badge in the transcript **filters** the view to that speaker only.

**Filter active state:**
- All other speakers' segments are dimmed (opacity 40%)
- Active speaker's segments are fully visible
- A filter indicator appears at top: "Showing: Speaker 1  [Clear filter ✕]"

### Design Decisions Needed
- Should speakers be renameable in the UI? (e.g., rename "Speaker 1" to "John")
- When no diarization was requested, should the Speakers panel tab/button be hidden or grayed out?
- Color palette: define 6 distinct, accessible colors for speaker badges

---

## DS-M6: In-Browser Transcription Editor

The most complex UI feature in the MVP. Users need to correct transcription mistakes inline.

### Entry / Exit

**Edit button** in the transcription detail header (pencil icon). Clicking enters edit mode.

### Edit Mode Visual Indicator

When in edit mode, the top action bar changes:

| Normal mode | Edit mode |
|---|---|
| "Edit" button | "Editing" amber/yellow label + pulsing dot |
| Download, Share buttons | "Save changes" (primary) + "Discard" (text/ghost) |

The overall page doesn't change — just the header transforms. No modal, no separate page.

### Editable Segments

Each transcript segment becomes editable in-place.

**View mode (current):**
```
[00:12]  Good morning, let's discuss the agenda...
```

**Edit mode:**
```
[00:12]  ┌─────────────────────────────────────────────┐
         │ Good morning, let's discuss the agenda...   │
         └─────────────────────────────────────────────┘
```

- Timestamp stays **read-only** (never editable — it's tied to audio timing)
- Text becomes a `<textarea>` or contenteditable `<div>` that auto-resizes vertically
- On focus: subtle blue outline (MUI focus style)
- The textarea has no visible border in unfocused state — blends with background to feel natural

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Tab` | Move focus to next segment |
| `Shift+Tab` | Move focus to previous segment |
| `Ctrl/Cmd+Enter` | Save all changes |
| `Escape` | Prompt to discard and exit edit mode |

### Auto-Save

Changes are automatically saved after 3 seconds of inactivity (debounced).

**Auto-save status indicator** (subtle, in header right area):

| State | Visual |
|---|---|
| No changes | Nothing shown |
| Unsaved changes | Small gray dot or "Unsaved" label |
| Saving | Spinner + "Saving…" |
| Saved | Checkmark + "Saved" (fades after 2s) |
| Save failed | Red ✕ + "Save failed" (stays until resolved) |

### Unsaved Changes Guard

If user tries to navigate away with unsaved changes, show confirmation:
> "You have unsaved changes. Leave and lose them?"
> [Stay]  [Leave anyway]

### Design Decisions Needed
- Should there be a "merge segments" feature (combine two short segments into one)? *(Recommendation: post-MVP, too complex for now)*
- Should users be able to add/delete segments, or only edit text? *(Recommendation: text-only edit for MVP)*
- Auto-save vs. manual save only — which is primary? *(Recommendation: auto-save primary, manual Save button as explicit confirm)*

---

## DS-M7: AI-Generated Summary

**Where:** Transcription detail page, collapsible panel above transcript segments.

### Collapsed State (default, no summary yet)

```
┌──────────────────────────────────────────────┐
│  ✨ AI Summary                [Generate →]   │
└──────────────────────────────────────────────┘
```

Clicking "Generate" sends the request and expands the panel to loading state.

### Loading State

```
┌──────────────────────────────────────────────┐
│  ✨ AI Summary                               │
│                                              │
│  ████████████████░░░░░░  ← skeleton line    │
│  ████████░░░░░░░░░░░░░░  ← skeleton line    │
│                                              │
│  • ████████████████░░░░                     │
│  • ████████░░░░░░░░░░░░                     │
│  • ██████████████░░░░░░                     │
└──────────────────────────────────────────────┘
```

Pulsing skeleton animation (MUI Skeleton component).

### Generated State

```
┌──────────────────────────────────────────────┐
│  ✨ AI Summary          [Copy] [Regenerate]  │
│                                              │
│  Overview                                    │
│  The meeting covered Q2 budget planning      │
│  with focus on timeline, headcount, and      │
│  tooling costs. Three concerns were raised.  │
│                                              │
│  Key Points                                  │
│  • Budget overage risk identified in Q2      │
│  • Headcount freeze proposed until July      │
│  • New tooling decision deferred to April    │
│                                              │
│  Action Items                                │
│  ☐  John to send updated budget by Friday   │
│  ☐  Sarah to review contractor contracts    │
│                                              │
└──────────────────────────────────────────────┘
```

**Typography:**
- "Overview", "Key Points", "Action Items" → small caps or semibold label
- Overview text → body/regular
- Key points → bulleted list
- Action items → checkbox list (visual only — not interactive in MVP)

**Actions:**
- "Copy" → copies the summary as markdown to clipboard. Shows "Copied ✓" for 2s.
- "Regenerate" → shows confirmation: "This will replace the current summary. Continue?" → Yes/No

### When No Summary Data Exists After Completion
If a transcription completed before this feature was added, show the "Generate" CTA.
If transcription is still in progress, the Summary panel should be hidden entirely or show: "Summary will be available once transcription completes."

### Design Decisions Needed
- Should action items be checkable (interactive checkboxes)? *(Recommendation: yes — adds value, low effort)*
- Should the summary panel be open or closed by default once generated?
- Should "Overview" be labeled or flow as body text without a header?

---

## DS-M8: Public Share Link

**Where:** Transcription detail header → "Share" button → opens modal.

### Share Modal

```
┌──────────────────────────────────────────────┐
│  Share this transcription               ✕   │
├──────────────────────────────────────────────┤
│                                              │
│  [  https://app.transcriber.io/s/a8Xk2  ]  │
│                              [ Copy link ]   │
│                                              │
│  Anyone with this link can view the          │
│  transcription and listen to the audio.      │
│  No login required.                          │
│                                              │
│  ─────────────────────────────────────────  │
│  [Disable link]                    [Done]   │
└──────────────────────────────────────────────┘
```

**States:**
- **Link not yet created:** Modal shows "Generate share link" button instead of URL field
- **Link active:** URL field + Copy button. "Disable link" in destructive/secondary style.
- **Copying:** Copy button shows "Copied ✓" for 2s
- **Disabling:** Confirmation prompt: "Disable this link? Anyone using it will lose access." → [Cancel] [Disable]
- **Link disabled:** Modal shows "Link disabled." + "Generate new link" button

### Share Button States (in header)
- **No link:** button icon is outline/muted, tooltip "Share"
- **Active link:** button icon is filled/colored (blue), tooltip "Shared — click to manage"

### Public View (`/s/:token`)

A simplified, read-only version of the transcription detail. No login required.

**What's present:**
- Minimal header: logo only (no nav links, no user avatar)
- Transcription title
- Audio player (if audio exists)
- Transcript segments (read-only)
- AI Summary panel (if generated, read-only)
- Footer: "Created with Transcriber" with link to homepage (soft branding)

**What's absent:**
- Edit button
- Delete button
- Download button
- Share button (can't share a share page)
- Filter / search controls

**Banner at top of public view:**
```
┌─────────────────────────────────────────────────────────┐
│  👁  You're viewing a shared transcription (read-only)  │
│                              [Create your own →]        │
└─────────────────────────────────────────────────────────┘
```

### Design Decisions Needed
- Should the public view show the speaker diarization / badges if they exist?
- Should the audio player be shown on the public view even if the owner's plan is free? *(Recommendation: yes — audio adds value to shared content)*
- Should we add an "Open in Transcriber" button for logged-in users viewing a shared link?

---

## DS-M9: Batch File Upload

**Where:** Home page upload widget (`/home`)

### Trigger Change

Current behavior: clicking "Browse" opens a single-file picker.
New behavior: file picker opens with `multiple` attribute — user can select many files.

Drag-and-drop zone changes copy to "Drop files here" (plural). When multiple files are dragged, show count badge on the drop zone: "Drop 4 files"

### Queue Panel

After selecting multiple files, instead of a single-file confirmation dialog, show the **upload queue panel**. (For a single file, keep the existing single-file dialog behavior.)

```
┌──────────────────────────────────────────────────┐
│  Upload Queue                               ✕   │
├──────────────────────────────────────────────────┤
│                                                  │
│  🎵  interview_john.mp3           2.3 MB  [✕]  │
│  🎵  interview_sarah.mp3          1.8 MB  [✕]  │
│  🎬  meeting_recording.mp4       14.2 MB  [✕]  │
│                                                  │
│  + Add more files                                │
├──────────────────────────────────────────────────┤
│  Language  [Auto-detect ▾]                       │
│                                                  │
│                          [Upload All (3 files)]  │
└──────────────────────────────────────────────────┘
```

- File type icon: 🎵 for audio, 🎬 for video
- [✕] button removes that file from the queue
- "+ Add more files" opens the file picker again to append more files
- File size shown in human-readable format (KB / MB)

### Upload in Progress

```
┌──────────────────────────────────────────────────┐
│  Uploading 3 files...                            │
├──────────────────────────────────────────────────┤
│  🎵  interview_john.mp3   ████████░░  80%  ↑   │
│  🎵  interview_sarah.mp3  ░░░░░░░░░░  —  queued │
│  🎬  meeting_recording.mp4  ░░░░░░░  —  queued  │
└──────────────────────────────────────────────────┘
```

- Active upload: animated progress bar
- Queued: empty bar, "queued" label
- Files are uploaded sequentially (one at a time)

### Error State (partial failure)

```
│  🎵  interview_john.mp3   ✓ Uploaded             │
│  🎵  interview_sarah.mp3  ✗ Failed  [Retry]      │
│  🎬  meeting_recording.mp4  ↑ Uploading...        │
```

If one file fails, show error inline for that file with a Retry button. Other files continue.

### After All Uploads

Panel closes automatically after 1s. User sees the transcriptions list updated with the new in-progress items.

### Design Decisions Needed
- Should there be a file count limit shown? e.g., "Max 10 files at once"
- Should there be a total size limit shown? e.g., "Max 500MB total"
- Should the panel be a modal dialog or a slide-in panel on the right side?

---

## DS-M10: Full-Text Content Search

**Where:** Transcriptions list page (`/transcriptions`) — search bar area

### Current Behavior
The search input searches by title only.

### New Behavior
Add a **search scope toggle** below or adjacent to the search input.

**Option A — Toggle below input:**
```
[🔍 Search transcriptions...         ]
Search in: ○ Title  ● Transcript content  ○ Both
```

**Option B — Inline dropdown:**
```
[Title ▾] [🔍 Search transcriptions...  ]
```

*Recommendation: Option B — more compact, standard pattern (similar to GitHub's search scope)*

### Results with Content Excerpts

When searching within transcript content, each result row shows a matched excerpt:

```
┌────────────────────────────────────────────────────────┐
│  🎵  Meeting with John                  Completed  2h ago │
│      "...the **budget** discussion was focused on Q2..." │
├────────────────────────────────────────────────────────┤
│  🎵  Q2 Planning Call                   Completed  3d ago │
│      "...Sarah mentioned the **budget** was at risk..."  │
└────────────────────────────────────────────────────────┘
```

- Excerpt: ~120 chars, centered around the matched keyword
- Matched keyword is **bold** (or highlighted with a subtle background color)
- Excerpt shown only when content search is active (not for title-only search)

### Empty State (content search)
```
No transcriptions found matching "budget" in transcript content.

Try searching in titles instead.  [Switch to title search]
```

### Design Decisions Needed
- Should title search results also show content excerpts if a content match also exists?
- Should "Both" (title + content) be a separate option or the default?

---

## POST-MVP FEATURES — Design Specs

---

## DS-P1: Team Invitations & Members

### New Settings Tab: "Team"

**Tab navigation in Settings** (new tab added):
Profile | Security | **Team** | Usage | Billing | API | Webhooks

### Team Tab Layout

```
┌──────────────────────────────────────────────────┐
│  Team                                            │
│                                                  │
│  Account name   [Acme Corp         ] [Save]      │  ← admin only
│                                                  │
│  ── Members (3) ──────────────────────────────   │
│                                                  │
│  [Avatar] John Smith        john@acme.co  Admin  │
│  [Avatar] Sarah Lee         sarah@acme.co Member [Remove] │
│  [Avatar] Mike Jones        mike@acme.co  Member [Remove] │
│                                                  │
│  ── Pending Invitations ───────────────────────  │
│                                                  │
│  anna@acme.co  Member  Expires in 5 days  [Resend] [Revoke] │
│                                                  │
│                              [+ Invite member]  │
└──────────────────────────────────────────────────┘
```

**Permissions:**
- Admins see "Remove" and "Invite" buttons
- Members see a read-only list with no actions

### Invite Member Modal

```
┌──────────────────────────────────────┐
│  Invite team member              ✕  │
│                                      │
│  Email address                       │
│  [____________________________]      │
│                                      │
│  Role                                │
│  ○ Admin  — Can manage team and all  │
│             transcriptions           │
│  ● Member — Can create and view      │
│             transcriptions           │
│                                      │
│  [Cancel]          [Send invitation] │
└──────────────────────────────────────┘
```

### Invitation Accept Page (`/invitations/:token/accept`)

Shown when recipient clicks the link in the invitation email.

- If logged out: show "You've been invited to join [Account Name] on Transcriber. Sign up or log in to accept."
- If logged in as wrong user: "This invitation was sent to [email]. You're logged in as [other email]. Switch accounts or log in with the correct email."
- If logged in as correct user: "Accept invitation to [Account Name]?" → [Accept] → redirect to `/home`

### Email Design (Invitation Email)

Subject: `You've been invited to join [Account Name] on Transcriber`

```
[Logo]

[Inviter Name] invited you to join [Account Name] on Transcriber.

[Accept Invitation →]

This invitation expires in 7 days.
If you didn't expect this, you can ignore this email.
```

---

## DS-P2: Usage Dashboard

**Where:** `/settings` → "Usage" tab

```
┌──────────────────────────────────────────────────┐
│  Usage — March 2026                              │
│                                          [Free plan → Upgrade] │
├──────────────────────────────────────────────────┤
│                                                  │
│  Transcription Minutes                           │
│  ████████████░░░░░░░░░░  245 / 500 min          │
│                                                  │
│  Files Processed    Storage Used                 │
│  23 files           1.2 GB / 5 GB               │
│  ████░░░░░░░░░░      ██░░░░░░░░░░               │
│                                                  │
│  ── Daily Usage (last 30 days) ───────────────   │
│                                                  │
│  [Bar chart: one bar per day]                    │
│  Y-axis: minutes. X-axis: dates.                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Plan limits per tier (to define):**

| Plan | Minutes/mo | Storage | Files |
|---|---|---|---|
| Free | 500 min | 5 GB | Unlimited |
| Pro | 3,000 min | 50 GB | Unlimited |
| Business | Unlimited | 200 GB | Unlimited |

**When approaching limit (80%+):**
Progress bar turns amber. Small inline warning: "You've used 80% of your monthly minutes. Upgrade to avoid interruptions."

**When at limit:**
Progress bar turns red. Upload widget shows inline error instead of submitting: "Monthly limit reached. Upgrade your plan to continue."

---

## DS-P3: Billing & Subscription

**Where:** `/settings` → "Billing" tab

### Current Plan Card

```
┌──────────────────────────────────────────────────┐
│  Current Plan                                    │
│                                                  │
│  Pro Plan                         $19/month      │
│  Renews April 22, 2026                           │
│  Visa •••• 4242                  [Manage card]   │
│                                                  │
│  [Cancel subscription]                           │
└──────────────────────────────────────────────────┘
```

### Plan Selection (for upgrade/downgrade)

Three side-by-side cards. Current plan has "Current" badge.

```
┌────────────┐  ┌────────────┐  ┌────────────┐
│   Free     │  │   Pro  ★  │  │  Business  │
│   $0/mo    │  │  $19/mo   │  │  $49/mo    │
│            │  │           │  │            │
│  500 min   │  │ 3,000 min │  │ Unlimited  │
│  5 GB      │  │ 50 GB     │  │ 200 GB     │
│  1 user    │  │ 5 users   │  │ 20 users   │
│            │  │           │  │            │
│ [Current]  │  │[Upgrade →]│  │[Upgrade →] │
└────────────┘  └────────────┘  └────────────┘
```

★ = "Most popular" badge

Clicking Upgrade redirects to Stripe Checkout (hosted page). On return → success or cancel state.

### Invoices Table

```
│  Date          │  Amount  │  Status  │  Invoice  │
│  Mar 1, 2026   │  $19.00  │  Paid    │  [PDF]    │
│  Feb 1, 2026   │  $19.00  │  Paid    │  [PDF]    │
│  Jan 1, 2026   │  $19.00  │  Paid    │  [PDF]    │
```

---

## DS-P4: Public REST API Keys

**Where:** `/settings` → "API" tab

```
┌──────────────────────────────────────────────────┐
│  API Access                                      │
│                                                  │
│  Use the Transcriber API to integrate            │
│  transcription into your own apps.               │
│  [View API docs →]                              │
│                                                  │
│  ── API Keys ─────────────────────────────────   │
│                                                  │
│  Production key   sk-live-••••abcd   Last used: today    [Revoke] │
│  Development key  sk-live-••••ef01   Never used           [Revoke] │
│                                                  │
│                              [+ Create new key]  │
└──────────────────────────────────────────────────┘
```

### Create Key Modal

```
┌──────────────────────────────────────┐
│  Create API key                  ✕  │
│                                      │
│  Name (for your reference)           │
│  [e.g. Production app              ] │
│                                      │
│  [Cancel]            [Generate key]  │
└──────────────────────────────────────┘
```

### Key Reveal (one-time only)

After creation, show the full key once:

```
┌──────────────────────────────────────────────────┐
│  API key created                                 │
│                                                  │
│  ⚠️  Copy this key now — it won't be shown again │
│                                                  │
│  sk-live-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7  │
│                              [Copy]              │
│                                                  │
│  [Done]                                          │
└──────────────────────────────────────────────────┘
```

Warning box with amber/yellow background. Key in monospace. "Done" is only available after copying (or after 30s timer).

---

## DS-P5: Webhooks

**Where:** `/settings` → "Webhooks" tab

```
┌──────────────────────────────────────────────────┐
│  Webhooks                                        │
│                                                  │
│  Receive HTTP notifications when events          │
│  happen in your account. [View webhook docs →]   │
│                                                  │
│  ── Endpoints ─────────────────────────────────  │
│                                                  │
│  https://myapp.com/webhooks/transcriber          │
│  Events: completed, failed   Status: ● Active    │
│  Last triggered: 2 hours ago   [Test] [Edit] [Delete] │
│                                                  │
│  https://hooks.zapier.com/...                    │
│  Events: completed   Status: ⚠ Failing (3 retries) │
│  Last triggered: 3 days ago    [Test] [Edit] [Delete] │
│                                                  │
│                            [+ Add endpoint]      │
└──────────────────────────────────────────────────┘
```

### Add/Edit Endpoint Modal

```
┌──────────────────────────────────────────────────┐
│  Add webhook endpoint                        ✕  │
│                                                  │
│  Endpoint URL                                    │
│  [https://...                               ]    │
│                                                  │
│  Events to send                                  │
│  ☑  transcription.completed                     │
│  ☑  transcription.failed                        │
│  ☐  transcription.created                       │
│                                                  │
│  [Cancel]                         [Save endpoint] │
└──────────────────────────────────────────────────┘
```

### Failing Endpoint State
Endpoint row shows amber warning icon ⚠, "Failing" label. On hover: tooltip "Last 3 delivery attempts failed. Check your endpoint URL."

---

## DS-V1: AI Q&A — Chat With Your Transcript

**Where:** Transcription detail page — right side panel, toggled by a chat icon button in the header.

### Panel Toggle Button
Chat bubble icon in the header action bar. When panel is closed: outlined. When open: filled/active color.

### Chat Panel

Panel slides in from the right (or below on mobile), taking ~30% of the viewport width on desktop.

```
┌─────────────────────────────────┐
│  💬 Ask about this transcript ✕ │
├─────────────────────────────────┤
│                                 │
│  Suggested questions:           │
│  • What decisions were made?    │
│  • List the action items        │
│  • Who spoke the most?          │
│                                 │
├─────────────────────────────────┤
│  [User]  What were the main     │
│  concerns raised about budget?  │
├─────────────────────────────────┤
│  [AI]  Three budget concerns    │
│  were raised:                   │
│                                 │
│  1. Q2 overage risk             │
│  2. Headcount freeze            │
│  3. Tooling costs               │
│                                 │
│  See [00:04:32] for details.   │  ← clickable timestamp
│                         [Copy] │
├─────────────────────────────────┤
│  [Ask a question...       ] [▶] │
└─────────────────────────────────┘
```

**Streaming response:** AI response appears character by character (like ChatGPT). Show a blinking cursor while streaming.

**Citations:** When AI references a specific moment in the transcript, it appears as a clickable timestamp link `[00:04:32]` that jumps the audio player to that point.

**Suggested questions:** Shown when the chat is empty (no messages yet). Clicking a suggestion fills the input and submits it.

**Copy button:** On each AI message. Copies response text to clipboard.

### Mobile
Panel takes full screen width as a bottom sheet. Swipe down to close.

---

## DS-V2: Translation

**Where:** Transcription detail header → "Translate" button

### Translate Modal

```
┌──────────────────────────────────────┐
│  Translate Transcript            ✕  │
│                                      │
│  Source language                     │
│  English (detected)                  │
│                                      │
│  Translate to                        │
│  [Select a language              ▾]  │
│                                      │
│  Translation powered by OpenAI.      │
│  Quality may vary for technical      │
│  content.                            │
│                                      │
│  [Cancel]              [Translate]   │
└──────────────────────────────────────┘
```

### Language Tab Switcher

Once a translation exists, a tab bar appears above the transcript:

```
[🇬🇧 English] [🇪🇸 Spanish] [🇫🇷 French ✕]
```

- Clicking a tab switches the displayed transcript language
- [✕] removes the translation (with confirmation: "Delete this translation?")
- "Translate" button becomes "Add language" once one translation exists

### Translation in Progress

While translating, the target language tab shows a spinner and "Translating…" label. Existing languages remain usable.

---

## DS-V3: Email Notifications

**Where:** `/settings` → Profile section — notification preferences area

### Notification Toggle

Simple toggle row below the name field:

```
┌──────────────────────────────────────────────────┐
│  Notifications                                   │
│                                                  │
│  Email me when transcriptions complete  [On ●]  │
└──────────────────────────────────────────────────┘
```

Default: On.

### Email Template Design

**Subject:** `✓ Your transcription "[Title]" is ready`

```
[Transcriber Logo]

Your transcription is ready.

"Meeting with John — Q2 Planning"
Duration: 42 minutes

Preview:
"Good morning everyone, let's get started
with the budget discussion. First I want
to..."

[View full transcription →]

────────────────────────────────
Transcriber · Unsubscribe
```

**Email design guidelines:**
- Max width: 600px
- Background: white (email clients may not support dark mode)
- CTA button: brand primary color
- No images except logo (improves deliverability)
- Plain-text fallback required

---

## Global Design Decisions Needed

These apply across all features and should be resolved before detailed design begins:

### 1. Typography System
No custom font is currently set — MUI defaults are used. Define:
- Primary font (headers): suggestion — Inter or Söhne
- Mono font (code, timestamps, API keys): suggestion — JetBrains Mono or Fira Code
- Body font: same as primary or separate

### 2. Brand Color
Primary action color is currently MUI default blue. Define the brand primary color to use for:
- Primary buttons
- Active states
- Share link icon when active
- Speaker badge default first color

### 3. Settings Sidebar Navigation
As settings grows (Profile, Security, Team, Usage, Billing, API, Webhooks) the settings page needs proper left sidebar navigation. Currently it's just stacked cards. Design a settings layout with:
- Left nav (desktop): icon + label vertical list
- Mobile: horizontal scrollable tab bar or back-button drill-down

### 4. Empty States
Define a consistent empty state component:
- Illustration or icon (suggestion: subtle line illustration, not heavy)
- Headline
- Body text
- Optional CTA button

Used in: transcriptions list, recent activity sidebar, chat panel, webhooks list, API keys list.

### 5. Toast / Notification System
Currently using `NotificationContext` with MUI Snackbar. Define:
- Position: bottom-right (current) — confirm this
- Duration: 3s for success, 5s for error — confirm
- Max simultaneous toasts: 3
- Stacking behavior (new toasts push up or replace?)

### 6. Confirmation Dialogs
Several features use `window.confirm()` (delete, discard changes, disable share link). Replace with:
- Custom MUI Dialog component
- Standard layout: title + message + [Cancel] [Confirm] buttons
- Destructive confirmations: confirm button in red

### 7. Mobile Navigation
Current NavBar has no mobile treatment. With new settings tabs, the navigation complexity increases. Define:
- Mobile nav pattern: hamburger → bottom drawer, or tab bar at bottom?
- Settings on mobile: full-screen with back button, or bottom sheet tabs?

---

## Accessibility Checklist (per feature)

Every new screen should meet:
- [ ] WCAG 2.1 AA contrast ratios (4.5:1 for text, 3:1 for UI components)
- [ ] All interactive elements keyboard-accessible (Tab, Enter, Space, Escape)
- [ ] Focus rings visible on all interactive elements
- [ ] Screen reader labels on icon-only buttons (aria-label)
- [ ] Form inputs have associated labels
- [ ] Error messages associated with their inputs (aria-describedby)
- [ ] Status changes announced to screen readers (aria-live regions for progress, toasts)
- [ ] Color is not the only differentiator (e.g., speaker badges need both color AND label)
- [ ] Minimum touch target 44×44px on mobile
