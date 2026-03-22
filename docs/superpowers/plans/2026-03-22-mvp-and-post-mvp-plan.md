# Transcriber — MVP & Post-MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a competitive, production-ready transcription SaaS with export, editing, speaker diarization, AI summaries, and share links as MVP, then grow into team collaboration, billing, and AI Q&A.

**Architecture:** Rails 7.2 API backend with Sidekiq background jobs; React 18 + TypeScript frontend using RTK Query for server state; ActionCable WebSockets for real-time updates; MUI Joy + MUI Material for UI.

**Tech Stack:** Ruby 3.3.9, Rails 7.2, PostgreSQL, Sidekiq, OpenAI Whisper, AssemblyAI (speaker diarization), React 18, TypeScript, RTK Query, Zustand, MUI Joy/Material, Vite, ActionCable.

---

## Status Legend

- [ ] Todo
- [x] Done
- [~] In progress

---

## Phase Index

| Phase | Scope | Target |
|---|---|---|
| **MVP** | Production-ready core + table-stakes features | Weeks 1–5 |
| **Post-MVP v1** | Growth: team, billing, API | Weeks 6–12 |
| **Post-MVP v2** | Moat: AI Q&A, podcast workflow | Weeks 13+ |

---

# MVP PHASE

## Task M1 — Fix Audio URL Bug (Blocker)

**Files:**
- Modify: `app/serializers/ajax/transcriptions/show_serializer.rb:23`
- Modify: `config/application.yml` (add `HOST` env var)

**What:** The `audio_transcription_path` method hardcodes `http://localhost:3000`. In production this breaks audio playback for every user.

**UI/UX Design Brief:** _No new UI needed. This is a bug fix._

- [ ] Add `HOST` to `config/application.yml.example` with value `http://localhost:3000`
- [ ] Fix `show_serializer.rb` line 23:
  ```ruby
  def audio_transcription_path
    return unless object.audio.attached?
    host = ENV.fetch('HOST', 'http://localhost:3000')
    "#{host}#{rails_blob_url(object.audio, only_path: true)}"
  end
  ```
- [ ] Verify audio plays on transcription detail page
- [ ] Commit: `fix: use HOST env var for audio blob URLs`

---

## Task M2 — Settings: Profile Name Update

**Files:**
- Create: `app/controllers/ajax/users_controller.rb`
- Modify: `config/routes.rb` — add `patch :profile` under ajax namespace
- Modify: `app/javascript/react/redux/resourcesApi/auth/authSlice.ts` — add `updateProfile` mutation
- Modify: `app/javascript/react/components/settings/Settings.tsx:65` — wire mutation

**What:** Settings page has a name update form (UI complete) but calls a `setTimeout` stub. Need backend endpoint + RTK mutation.

### UI/UX Design Brief — Profile Settings

**Screen:** `/settings` → "Profile" section
**Layout:** Card with a single form row. Left: label "Display Name". Right: text input (pre-filled with current name) + "Save" button inline.
**States:**
- _Default_ — input shows current `user.first_name + last_name`, button disabled until value changes
- _Loading_ — button shows spinner, input disabled
- _Success_ — green checkmark replaces spinner for 2s, input re-enabled
- _Error_ — red inline error below input: "Failed to update. Try again."

**Interactions:**
- Input validates on blur: name must be 2–60 chars, no special chars
- Pressing Enter submits the form
- Success toast: "Name updated" (3s, bottom-right)

- [ ] Write failing test for `Ajax::UsersController#update_profile` (RSpec)
- [ ] Create `app/controllers/ajax/users_controller.rb`:
  ```ruby
  class Ajax::UsersController < ApplicationController
    before_action :authenticate_user!

    def update_profile
      if current_user.update(first_name: params[:first_name], last_name: params[:last_name])
        render json: { first_name: current_user.first_name, last_name: current_user.last_name }
      else
        render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
  ```
- [ ] Add route in `config/routes.rb` under `namespace :ajax`:
  ```ruby
  resource :user, only: [] do
    patch :update_profile
  end
  ```
- [ ] Add `updateProfile` mutation to `authSlice.ts`:
  ```ts
  updateProfile: builder.mutation<{ firstName: string; lastName: string }, { firstName: string; lastName: string }>({
    query: (body) => ({ url: 'user/update_profile', method: 'PATCH', body }),
    transformResponse: (r: any) => toCamelCase(r),
  }),
  ```
- [ ] Replace `setTimeout` stub in `Settings.tsx:65` with real mutation call
- [ ] Run test suite, verify passing
- [ ] Commit: `feat: connect settings name update to API`

---

## Task M3 — Settings: Password Change

**Files:**
- Modify: `app/controllers/ajax/users_controller.rb` — add `update_password`
- Modify: `config/routes.rb`
- Modify: `app/javascript/react/redux/resourcesApi/auth/authSlice.ts`
- Modify: `app/javascript/react/components/settings/Settings.tsx:120`

**What:** Same pattern as M2 — UI form exists with stub. Need backend + frontend wiring.

### UI/UX Design Brief — Password Change

**Screen:** `/settings` → "Security" section
**Layout:** Card with 3 stacked inputs: "Current Password", "New Password", "Confirm Password". Each has show/hide eye icon. "Change Password" button below.
**States:**
- _Default_ — all fields empty, button enabled
- _Validation error_ — inline red text below each invalid field
- _Loading_ — button spinner, all inputs disabled
- _Success_ — inputs cleared, success toast
- _Wrong current password_ — inline error on "Current Password" field: "Incorrect password"

**Rules:**
- New password min 8 chars
- Strength indicator bar (weak / medium / strong) appears under new password field as user types
- Strength: weak = <8, medium = 8+ alphanumeric, strong = 8+ with special char + number

- [ ] Add Devise password update method to `Ajax::UsersController`:
  ```ruby
  def update_password
    if current_user.update_with_password(
      current_password: params[:current_password],
      password: params[:password],
      password_confirmation: params[:password_confirmation]
    )
      bypass_sign_in(current_user)
      render json: { message: 'Password updated' }
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end
  ```
- [ ] Add route: `patch :update_password` under `resource :user`
- [ ] Add `updatePassword` mutation to `authSlice.ts`
- [ ] Replace `setTimeout` stub in `Settings.tsx:120`
- [ ] Commit: `feat: connect settings password change to API`

---

## Task M4 — Export Transcription (TXT / SRT / VTT)

**Files:**
- Create: `app/services/transcriptions/exporter.rb`
- Modify: `app/controllers/ajax/transcriptions_controller.rb` — add `export` action
- Modify: `config/routes.rb` — add `get :export` member route
- Modify: `app/javascript/react/components/transcription/transcriptionsTable/StyledTranscriptionsTable.tsx:67`
- Modify: `app/javascript/react/components/transcription/transcriptionShow/TranscriptionShow.tsx` — wire download button
- Modify: `app/javascript/react/redux/resourcesApi/transcriptions/transcriptionsSlice.ts` — add export endpoint

**What:** Download button is a stub showing "Coming soon". Users need TXT, SRT, and VTT formats. These are the table-stakes formats every competitor offers.

### UI/UX Design Brief — Export

**Entry point 1 — Transcription table:** Download icon button in each row. On click → opens a small dropdown/popover with 3 options: "Plain text (.txt)", "Subtitles (.srt)", "Web subtitles (.vtt)". Selecting one triggers download immediately. No modal.

**Entry point 2 — Transcription detail page:** "Download" button in the top action bar (currently has the DownloadIcon but is unwired). Same dropdown behavior as table.

**States:**
- _Idle_ — button with download icon, tooltip "Download transcript"
- _Dropdown open_ — small Menu with 3 items, each with a file-type icon
- _Downloading_ — button briefly shows circular progress (300ms), then browser download dialog opens
- _Error_ — toast "Export failed, try again"

**Format specs:**
- **TXT**: plain text, each segment on its own line, no timestamps
- **SRT**: standard subtitle format with sequence numbers, `HH:MM:SS,mmm --> HH:MM:SS,mmm` timestamps, blank lines between entries
- **VTT**: WebVTT format starting with `WEBVTT`, timestamps as `HH:MM:SS.mmm --> HH:MM:SS.mmm`

- [ ] Write RSpec tests for `Transcriptions::Exporter`:
  ```ruby
  describe Transcriptions::Exporter do
    it 'exports as plain text'
    it 'exports as SRT with proper formatting'
    it 'exports as VTT with WEBVTT header'
  end
  ```
- [ ] Create `app/services/transcriptions/exporter.rb`:
  ```ruby
  class Transcriptions::Exporter
    FORMATS = %w[txt srt vtt].freeze

    def self.call(transcription, format)
      new(transcription, format).export
    end

    def initialize(transcription, format)
      @transcription = transcription
      @format = format.to_s.downcase
      raise ArgumentError, "Unknown format: #{@format}" unless FORMATS.include?(@format)
    end

    def export
      send("to_#{@format}")
    end

    private

    def segments
      return [] if @transcription.transcription_json.nil?
      json = @transcription.transcription_json
      json = json.first if json.is_a?(Array)
      json['segments'] || []
    end

    def to_txt
      segments.map { |s| s['text'].strip }.join("\n")
    end

    def to_srt
      segments.each_with_index.map do |s, i|
        "#{i + 1}\n#{srt_time(s['start'])} --> #{srt_time(s['end'])}\n#{s['text'].strip}"
      end.join("\n\n")
    end

    def to_vtt
      body = segments.each_with_index.map do |s, i|
        "#{i + 1}\n#{vtt_time(s['start'])} --> #{vtt_time(s['end'])}\n#{s['text'].strip}"
      end.join("\n\n")
      "WEBVTT\n\n#{body}"
    end

    def srt_time(seconds)
      ms = ((seconds % 1) * 1000).round
      h, r = seconds.divmod(3600)
      m, s = r.divmod(60)
      format('%02d:%02d:%02d,%03d', h, m, s, ms)
    end

    def vtt_time(seconds)
      ms = ((seconds % 1) * 1000).round
      h, r = seconds.divmod(3600)
      m, s = r.divmod(60)
      format('%02d:%02d:%02d.%03d', h, m, s, ms)
    end
  end
  ```
- [ ] Add `export` action to `Ajax::TranscriptionsController`:
  ```ruby
  def export
    format = params[:format]
    unless %w[txt srt vtt].include?(format)
      return render json: { error: 'Invalid format' }, status: :bad_request
    end

    content = Transcriptions::Exporter.call(@transcription, format)
    filename = "#{@transcription.title.parameterize}.#{format}"
    send_data content, filename: filename, type: 'text/plain', disposition: 'attachment'
  end
  ```
- [ ] Add `before_action :set_transcription` and `verify_ownership` for `export` action
- [ ] Add route: `get :export, on: :member` under `ajax/transcriptions`
- [ ] Add `exportTranscription` query in `transcriptionsSlice.ts` that fetches as blob
- [ ] Replace stub in `StyledTranscriptionsTable.tsx:67` with format dropdown + download trigger
- [ ] Wire Download button in `TranscriptionShow.tsx`
- [ ] Run tests
- [ ] Commit: `feat: add TXT/SRT/VTT export for transcriptions`

---

## Task M5 — Wire Recent Activity Sidebar

**Files:**
- Modify: `app/javascript/react/components/home/SidebarRecentActivity.tsx`
- Reuse: `useGetTranscriptionsQuery` from `transcriptionsSlice.ts`

**What:** `SidebarRecentActivity.tsx` is a placeholder with a TODO comment. It should show the last 5 transcriptions with status and a link to each.

### UI/UX Design Brief — Recent Activity Sidebar

**Layout:** Vertical list of up to 5 items. Each item:
- Left: status icon (colored dot — green=completed, orange=in progress, red=failed)
- Center: transcription title (truncated at 24 chars with ellipsis), subtitle with relative time ("2 hours ago")
- Right: nothing (item is clickable as a whole)

**States:**
- _Loading_ — 3 skeleton rows (MUI Skeleton, same height as items)
- _Empty_ — single line: "No transcriptions yet. Upload your first file."
- _Populated_ — list of items

**Interactions:**
- Clicking an item navigates to `/transcriptions/:id`
- Status dot pulses (CSS animation) when status is `in_progress` or `transcribing`

- [ ] Update `SidebarRecentActivity.tsx`:
  ```tsx
  const SidebarRecentActivity = () => {
    const { data, isLoading } = useGetTranscriptionsQuery({ page: 1 });
    const recent = data?.transcriptions?.slice(0, 5) ?? [];
    // render skeleton, empty state, or list
  };
  ```
- [ ] Add status color map and pulsing dot styles
- [ ] Commit: `feat: wire recent activity sidebar with latest transcriptions`

---

## Task M6 — Speaker Diarization

**Files:**
- Create: `app/services/assembly_ai_service.rb`
- Modify: `app/models/transcription.rb` — add `speakers_json` column (migration)
- Create: `db/migrate/YYYYMMDD_add_speakers_to_transcriptions.rb`
- Modify: `app/interactors/transcriptions/transcribe.rb` — optional diarization step
- Modify: `app/serializers/ajax/transcriptions/show_serializer.rb` — add `speakers` attribute
- Modify: `app/javascript/react/components/transcription/transcriptionShow/TranscriptionShowTranscription.tsx` — render speaker labels
- Modify: `app/javascript/react/redux/resourcesApi/transcriptions/types.ts` — add speaker fields

**What:** No competitors with a clean UI skip speaker identification. This is P1 — required for meeting/interview use cases. Use AssemblyAI as a secondary provider (it supports diarization natively). Whisper-only flow won't change — diarization is an opt-in enrichment step after transcription.

### UI/UX Design Brief — Speaker Diarization

**Upload UI:** Add a "Identify speakers" toggle in the `QuickAddFileOrUrl` dialog under language selector. Default: off. When enabled, shows a "Number of speakers" stepper (2–10, default: "Auto-detect").

**Transcription detail view:** When diarization data exists, each segment gets a speaker badge: "Speaker 1", "Speaker 2", etc. Color-coded consistently per speaker (6-color palette, repeating). Clicking a speaker badge filters the transcript to show only that speaker's lines. Speaker badges are shown inline before each segment's text.

**Speaker panel (sidebar):** When diarization data exists, show a collapsible panel on the right side of the detail view listing speakers with: color dot, label "Speaker N", total talk time as percentage bar, word count.

**States:**
- _No diarization_ — segments display without speaker labels (current behavior, no change)
- _With diarization_ — segments show colored speaker badges
- _Active filter_ — clicking a speaker grays out other speakers' segments

- [ ] Add `gem 'assemblyai'` to Gemfile, `bundle install`
- [ ] Add migration: `add_column :transcriptions, :speakers_json, :jsonb`
- [ ] Create `app/services/assembly_ai_service.rb` with:
  - `transcribe(file_path, speakers_expected: nil)` — upload file, poll for completion
  - Returns `{ text:, segments:, speakers: }` hash
- [ ] Add `diarization_enabled` and `speakers_expected` to `transcriptions_params` in controller
- [ ] Update `Transcriptions::Transcribe` interactor to call AssemblyAI when `diarization_enabled`
- [ ] Add `speakers` attribute to show serializer
- [ ] Update `QuickAddFileOrUrl` to show diarization toggle
- [ ] Render speaker badges in `TranscriptionShowTranscription.tsx`
- [ ] Add speaker filter UI
- [ ] Commit: `feat: add speaker diarization via AssemblyAI`

---

## Task M7 — In-Browser Transcription Editor

**Files:**
- Modify: `app/controllers/ajax/transcriptions_controller.rb` — add `update` action
- Modify: `config/routes.rb` — add `patch` to ajax transcriptions
- Create: `app/interactors/transcriptions/update.rb`
- Modify: `app/javascript/react/redux/resourcesApi/transcriptions/transcriptionsSlice.ts` — add `updateTranscription`
- Create: `app/javascript/react/components/transcription/transcriptionShow/TranscriptionEditor.tsx`
- Modify: `app/javascript/react/components/transcription/transcriptionShow/TranscriptionShow.tsx` — toggle editor mode

**What:** Users need to correct Whisper mistakes. The editor should be inline — clicking a segment makes it editable in-place. This is the most-requested feature across all transcription tools.

### UI/UX Design Brief — Inline Transcription Editor

**Entry:** "Edit" button in the transcription detail header (pencil icon). Toggles the entire transcript into edit mode.

**Edit mode indicator:** Top bar changes to amber/yellow tint with "Editing" label. Header shows "Save changes" (primary button) and "Discard" (ghost button).

**Segment editing:** Each segment becomes a content-editable text block (or `<textarea>` that auto-resizes). The timestamp stays read-only to the left. On focus: subtle blue border around the segment.

**Keyboard shortcuts:**
- `Tab` — move to next segment
- `Shift+Tab` — move to previous segment
- `Ctrl/Cmd+Enter` — save all changes
- `Escape` — discard and exit edit mode

**Auto-save:** Debounced auto-save 3 seconds after last keystroke. Small "Saving…" spinner in header while saving, "Saved" checkmark when done.

**Unsaved changes guard:** Navigating away with unsaved changes shows browser confirm dialog: "You have unsaved changes. Leave anyway?"

**States:**
- _View mode_ — read-only segments (current behavior)
- _Edit mode_ — editable segments, amber header bar, Save/Discard buttons
- _Saving_ — header shows "Saving…" spinner
- _Saved_ — header shows "Saved ✓" for 2s then returns to edit mode indicator
- _Error_ — toast "Save failed, try again"

- [ ] Write RSpec tests for `Transcriptions::Update`
- [ ] Create `app/interactors/transcriptions/update.rb`:
  ```ruby
  class Transcriptions::Update < ActiveInteractor::Base
    def perform
      transcription = Transcription.find(context.id)
      unless transcription.owned_by?(context.user)
        context.fail!(errors: ['Not authorized'])
        return
      end

      unless transcription.update(
        transcription: context.transcription_text,
        transcription_json: context.transcription_json
      )
        context.fail!(errors: transcription.errors.full_messages)
      end

      context.transcription = transcription
    end
  end
  ```
- [ ] Add `update` action to `Ajax::TranscriptionsController`
- [ ] Add `patch` to `resources :transcriptions, only: %i[index show create destroy update]`
- [ ] Add `updateTranscription` mutation to RTK slice
- [ ] Create `TranscriptionEditor.tsx` — wraps segments with contenteditable divs, manages dirty state
- [ ] Add Edit/Save/Discard controls to `TranscriptionShow.tsx`
- [ ] Implement auto-save with `useCallback` + `debounce`
- [ ] Add beforeunload guard for unsaved changes
- [ ] Commit: `feat: add inline transcription editor`

---

## Task M8 — AI-Generated Summary

**Files:**
- Modify: `app/models/transcription.rb` — add `summary` text column (migration)
- Create: `db/migrate/YYYYMMDD_add_summary_to_transcriptions.rb`
- Create: `app/services/transcriptions/summarizer.rb`
- Create: `app/sidekiq/summarize_transcription_worker.rb`
- Modify: `app/controllers/ajax/transcriptions_controller.rb` — add `summarize` action
- Modify: `config/routes.rb` — add `post :summarize` member route
- Modify: `app/serializers/ajax/transcriptions/show_serializer.rb` — add `summary`
- Create: `app/javascript/react/components/transcription/transcriptionShow/TranscriptionSummary.tsx`
- Modify: `app/javascript/react/components/transcription/transcriptionShow/TranscriptionShow.tsx`

**What:** Competitors (Otter, Fireflies, Grain) all generate AI summaries. This is a high-value feature that gives users a reason to stay after transcription completes. Uses OpenAI GPT to summarize the transcript text with key points and action items.

### UI/UX Design Brief — AI Summary

**Location:** Collapsible panel above the transcript segments in the detail view. Default: collapsed if not yet generated.

**Panel header:** "AI Summary" with a sparkle/magic icon. Right side: "Generate" button (if no summary exists) or "Regenerate" (if summary exists).

**Generated summary layout:**
```
┌─────────────────────────────────────────────┐
│ ✨ AI Summary                    Regenerate │
│                                             │
│ Overview                                    │
│ 2-3 sentence paragraph                      │
│                                             │
│ Key Points                                  │
│ • Point 1                                   │
│ • Point 2                                   │
│ • Point 3                                   │
│                                             │
│ Action Items                                │
│ ☐ Action 1                                  │
│ ☐ Action 2                                  │
└─────────────────────────────────────────────┘
```

**States:**
- _Not generated_ — collapsed panel with "Generate summary" button
- _Generating_ — pulsing skeleton lines (3 lines for overview, 3 bullet skeletons, 2 checkbox skeletons)
- _Generated_ — structured content as above
- _Regenerate_ — same loading state, then updates content

**Interaction:** "Copy summary" icon button in top-right of expanded panel copies markdown-formatted summary to clipboard.

- [ ] Add migration: `add_column :transcriptions, :summary, :text`
- [ ] Create `app/services/transcriptions/summarizer.rb`:
  ```ruby
  class Transcriptions::Summarizer
    PROMPT = <<~PROMPT
      You are an expert meeting notes assistant.
      Given a transcript, return a JSON object with:
      - "overview": 2-3 sentence summary
      - "key_points": array of 3-5 bullet strings
      - "action_items": array of strings (tasks or follow-ups), empty array if none

      Respond ONLY with valid JSON.
    PROMPT

    def self.call(transcription_text)
      client = OpenAI::Client.new(access_token: ENV['OPENAI_API_KEY'])
      response = client.chat(
        parameters: {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: PROMPT },
            { role: 'user', content: transcription_text.truncate(12_000) }
          ],
          response_format: { type: 'json_object' }
        }
      )
      JSON.parse(response.dig('choices', 0, 'message', 'content'))
    end
  end
  ```
- [ ] Create `SummarizeTranscriptionWorker` Sidekiq job
- [ ] Add `summarize` action (POST) to controller — enqueues worker, returns `{ status: 'processing' }`
- [ ] Add route and serializer attribute
- [ ] Create `TranscriptionSummary.tsx` component
- [ ] Integrate into `TranscriptionShow.tsx` above segments
- [ ] Commit: `feat: add AI-generated transcript summary`

---

## Task M9 — Public Share Link

**Files:**
- Modify: `app/models/transcription.rb` — add `share_token` string column (migration)
- Create: `db/migrate/YYYYMMDD_add_share_token_to_transcriptions.rb`
- Create: `app/controllers/public/transcriptions_controller.rb`
- Modify: `config/routes.rb` — add public namespace
- Create: `app/serializers/public/transcription_serializer.rb`
- Create: `app/javascript/react/components/transcription/TranscriptionPublic.tsx`
- Modify: `app/javascript/react/routes/routes.tsx` — add `/s/:token` public route
- Modify: `app/javascript/react/components/transcription/transcriptionShow/TranscriptionShow.tsx` — add Share button

**What:** Users want to share transcriptions with colleagues, clients, or for review. A public share link (no login required) is the simplest implementation.

### UI/UX Design Brief — Share Link

**Entry point:** "Share" button in transcription detail header (share/link icon). Opens a modal.

**Share modal:**
```
┌───────────────────────────────────────────┐
│  Share this transcription           ✕     │
│                                           │
│  [  https://app.com/s/abc123xyz  ] [Copy] │
│                                           │
│  Anyone with this link can view the       │
│  transcription (read-only, no login).     │
│                                           │
│  [Disable link]           [Done]          │
└───────────────────────────────────────────┘
```

**Public view** (`/s/:token`): Simplified version of the transcription detail page:
- No navbar with user menu (just logo)
- Read-only transcript (no Edit, Delete, Download buttons)
- Audio player still present if audio exists
- "Created with Transcriber" badge in footer (soft branding)
- No login wall

**States:**
- _Link not yet generated_ — Share button shows "Get share link"
- _Link active_ — modal shows URL, "Disable link" button
- _Link disabled_ — "Share link is disabled. Generate new link?" with CTA
- _Copying_ — "Copied!" checkmark for 2s

- [ ] Add migration: `add_column :transcriptions, :share_token, :string, index: true`
- [ ] Add `generate_share_token` and `disable_share_link` methods to `Transcription` model
- [ ] Create `Public::TranscriptionsController#show` — finds by token, no auth required
- [ ] Add route: `namespace :public do; resources :transcriptions, only: [:show]; end` + `get '/s/:token'`
- [ ] Create public serializer (subset of show serializer, omits sensitive fields)
- [ ] Create `TranscriptionPublic.tsx` with minimal layout
- [ ] Add `/s/:token` route to React router (not protected)
- [ ] Add Share button + modal to `TranscriptionShow.tsx`
- [ ] Add RTK mutation for `toggleShareLink`
- [ ] Commit: `feat: add public share link for transcriptions`

---

## Task M10 — Batch File Upload

**Files:**
- Modify: `app/javascript/react/components/home/QuickAddFile/QuickAddFileOrUrl.tsx` — support multiple files
- Create: `app/javascript/react/components/home/QuickAddFile/BatchUploadQueue.tsx`
- Reuse: `useCreateTranscriptionMutation` called sequentially per file

**What:** Users want to upload multiple files at once (e.g., all interview recordings). The backend already handles one file per request — the frontend just needs to queue and process them sequentially.

### UI/UX Design Brief — Batch Upload

**Drop zone behavior:** Change from "drop a file" to "drop files" (plural). Shows count badge when multiple files are dragged: "Drop 3 files".

**After drop:** Instead of a single-file dialog, show a queue panel (not a dialog):
```
┌──────────────────────────────────────────────┐
│ Upload Queue (3 files)                  ✕    │
├──────────────────────────────────────────────┤
│ 🎵 interview_john.mp3        2.3 MB  [✕]    │
│ 🎵 interview_sarah.mp3       1.8 MB  [✕]    │
│ 🎬 meeting_recording.mp4     14 MB   [✕]    │
├──────────────────────────────────────────────┤
│ Language: [Auto-detect ▾]                    │
│                                              │
│              [Upload All]                    │
└──────────────────────────────────────────────┘
```

**During upload — per-file progress:**
```
│ 🎵 interview_john.mp3   ██████░░░░  60%  uploading │
│ 🎵 interview_sarah.mp3  ░░░░░░░░░░  —    queued    │
│ 🎬 meeting.mp4          ░░░░░░░░░░  —    queued    │
```

**After all queued:** Queue closes, user sees transcriptions list updated with new items (each in progress).

**Error handling:** If one file fails, that file shows red status with "Retry" button. Others continue.

- [ ] Update file input in `QuickAddFileOrUrl.tsx` to accept `multiple`
- [ ] Replace single-file dialog flow with `BatchUploadQueue.tsx` component
- [ ] Create upload queue state (array of `{ file, status, progress }`)
- [ ] Process files sequentially: `for (const file of files) { await createTranscription(...) }`
- [ ] Show per-file progress during upload phase
- [ ] Handle partial failures gracefully
- [ ] Commit: `feat: support batch file upload with queue UI`

---

## Task M11 — Full-Text Search Within Transcription Content

**Files:**
- Create: `db/migrate/YYYYMMDD_add_transcription_search_index.rb` — PostgreSQL tsvector index
- Modify: `app/models/transcription.rb` — add `search_by_content` scope
- Modify: `app/interactors/transcriptions/index.rb` — pass content search param
- Modify: `app/controllers/ajax/transcriptions_controller.rb` — accept `content_q` param
- Modify: `app/javascript/react/components/transcription/Transcriptions.tsx` — add content search toggle
- Modify: `app/javascript/react/redux/resourcesApi/transcriptions/transcriptionsSlice.ts` — add `content_q` param

**What:** Current search only matches transcription titles. Users expect to find transcriptions by spoken content (e.g., "find the meeting where we discussed budget").

### UI/UX Design Brief — Content Search

**Search bar behavior:** Existing search input gains a toggle below it: "Search in: [Title ▾]" → dropdown: "Title" / "Transcript content" / "Both".

**Results highlighting:** When content search is active, each row in the transcriptions table shows a matched excerpt below the title:
```
Meeting with John                          Completed  2h ago
"...the budget discussion was mainly about Q2 targets..."
```
The matched keyword is bolded within the excerpt.

**Empty state:** "No transcriptions found matching '[query]' in transcript content. Try searching titles instead."

- [ ] Create migration adding `transcription` column GIN index:
  ```ruby
  add_index :transcriptions, "to_tsvector('english', coalesce(transcription, ''))",
            using: :gin, name: 'idx_transcriptions_content_search'
  ```
- [ ] Add scope to `Transcription` model:
  ```ruby
  scope :search_by_content, lambda { |query|
    where("to_tsvector('english', coalesce(transcription, '')) @@ plainto_tsquery('english', ?)", query) if query.present?
  }
  ```
- [ ] Update `Transcriptions::Index` interactor to use `search_by_content` when `content_q` param present
- [ ] Add `content_q` and `search_mode` params to controller and RTK slice
- [ ] Update search UI in `Transcriptions.tsx` with search mode toggle
- [ ] Render excerpt with highlight in table rows
- [ ] Commit: `feat: add full-text search within transcription content`

---

## Task M12 — Mobile Responsive Audit & Fix

**Files:**
- Modify: `app/javascript/react/components/home/Home.tsx`
- Modify: `app/javascript/react/components/layout/NavBar.tsx`
- Modify: `app/javascript/react/components/transcription/Transcriptions.tsx`
- Modify: `app/javascript/react/components/transcription/transcriptionShow/TranscriptionShow.tsx`

**What:** The app targets desktop but needs to be usable on tablets and phones (768px+).

### UI/UX Design Brief — Mobile Layout

**Breakpoints:** Follow MUI defaults — `xs` (<600px), `sm` (600–900px), `md` (900px+).

**NavBar (mobile):** Replace nav links with a hamburger menu (≡). Opens a bottom drawer with nav items. User avatar visible at all times.

**Home page (mobile):** Upload component stacks vertically. Recent transcriptions table collapses to card list view (title, status badge, relative time, action icons).

**Transcriptions page (mobile):** Filter panel collapses behind a "Filter" button (funnel icon). Table becomes a card list. Pagination shows "Previous / Next" buttons only (no page numbers).

**Transcription detail (mobile):** Audio player sticks to bottom of screen. Transcript segments are full-width. Action buttons (Edit, Share, Download) collapse into a "..." overflow menu. Summary panel is hidden behind a tab.

**Key rules:**
- Min touch target size: 44x44px
- No horizontal scroll on any page
- Font sizes: minimum 14px body, 16px inputs (to prevent iOS auto-zoom)

- [ ] Audit each page at 375px, 768px, 1024px widths using browser devtools
- [ ] Fix NavBar: add hamburger + bottom drawer for mobile
- [ ] Fix table → card-list responsive switch at `xs`
- [ ] Fix TranscriptionShow: sticky audio player + overflow action menu
- [ ] Fix filter panel: collapsible on mobile
- [ ] Commit: `fix: mobile responsive layout improvements`

---

# POST-MVP PHASE v1 — Growth & Monetization

## Task P1 — Team Invitations & Multi-Member Accounts

**Files:**
- Create: `app/models/invitation.rb` + migration
- Create: `app/controllers/ajax/invitations_controller.rb`
- Create: `app/mailers/invitation_mailer.rb`
- Modify: `app/models/user.rb` — add `role` column
- Create: `app/javascript/react/components/settings/TeamSettings.tsx`
- Modify: `config/routes.rb`

### UI/UX Design Brief — Team Settings

**New settings tab:** "Team" tab in Settings page sidebar (alongside Profile, Security).

**Team tab layout:**
- Section header: Account name (editable inline for admins)
- Members table: avatar, name, email, role badge (Admin/Member), date joined, "Remove" button (admin only)
- "Invite member" button opens a modal:
  ```
  ┌─────────────────────────────┐
  │  Invite team member     ✕  │
  │                             │
  │  Email address              │
  │  [____________________]     │
  │                             │
  │  Role                       │
  │  ○ Admin  ● Member          │
  │                             │
  │  [Cancel]    [Send invite]  │
  └─────────────────────────────┘
  ```
- Pending invitations section: shows email + "Resend" + "Revoke" actions for each
- Invitation expiry: 7 days (shown as "Expires in 5 days")

**Invitation email:** Plain-text email with accept link. Accept page requires login or signup.

- [ ] Create `invitations` table: `email`, `account_id`, `role`, `token`, `accepted_at`, `expires_at`
- [ ] Create `Invitation` model with `accepted?`, `expired?` methods
- [ ] Create `InvitationsController` with `create`, `accept` actions
- [ ] Create `InvitationMailer` with invitation email template
- [ ] Add `role` enum to `User` model (admin/member)
- [ ] Add role-based authorization checks to controllers
- [ ] Create `TeamSettings.tsx` component
- [ ] Add "Team" tab to settings sidebar
- [ ] Commit: `feat: team invitations and multi-member accounts`

---

## Task P2 — Usage Dashboard

**Files:**
- Create: `app/controllers/ajax/usage_controller.rb`
- Create: `app/javascript/react/components/settings/UsageDashboard.tsx`
- Modify: `config/routes.rb`

### UI/UX Design Brief — Usage Dashboard

**Location:** "Usage" tab in Settings.

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Usage — March 2026                          │
│                                             │
│  Transcription Minutes                      │
│  ████████████░░░░░░░░  245 / 500 min used   │
│                                             │
│  Files Processed        Storage Used        │
│  23 files               1.2 GB / 5 GB       │
│                                             │
│  ── Monthly Breakdown ──────────────────── │
│  [Bar chart: minutes per day, last 30 days] │
│                                             │
│  Plan: Free   [Upgrade →]                   │
└─────────────────────────────────────────────┘
```

**Metrics shown:**
- Minutes transcribed this month vs. plan limit
- Total files processed this month
- Storage used vs. plan limit
- Daily usage bar chart (last 30 days)
- Current plan name + upgrade CTA

- [ ] Add `duration` aggregation query to `UsageController`
- [ ] Create `UsageDashboard.tsx` with progress bars and bar chart (use MUI or recharts)
- [ ] Commit: `feat: usage dashboard in settings`

---

## Task P3 — Billing & Subscription (Stripe)

**Files:**
- Add: `gem 'stripe'`
- Create: `app/controllers/ajax/billing_controller.rb`
- Create: `app/controllers/webhooks/stripe_controller.rb`
- Modify: `app/models/account.rb` — add `stripe_customer_id`, `plan`, `plan_expires_at`
- Create: `app/javascript/react/components/settings/BillingSettings.tsx`

### UI/UX Design Brief — Billing

**Location:** "Billing" tab in Settings.

**Current plan card:** Shows plan name, price, renewal date, "Cancel subscription" link.

**Plan selection:** 3-column pricing cards (Free / Pro / Business). Current plan highlighted. "Upgrade" opens Stripe Checkout (hosted page redirect). "Downgrade" shows confirmation modal.

**Invoices table:** Date, amount, status (Paid/Refunded), "Download PDF" link. Shows last 12 invoices.

**Payment method:** Shows masked card (Visa •••• 4242) + "Update card" button (opens Stripe billing portal).

- [ ] Set up Stripe products and prices via Stripe dashboard
- [ ] Create `BillingController` with `portal`, `checkout` actions
- [ ] Create Stripe webhook handler for `customer.subscription.updated`, `invoice.paid`
- [ ] Add Stripe fields to `Account` model migration
- [ ] Create `BillingSettings.tsx` with plan cards and invoice table
- [ ] Gate features behind plan limits (middleware or Pundit policy)
- [ ] Commit: `feat: Stripe billing and subscription management`

---

## Task P4 — Public REST API with API Keys

**Files:**
- Create: `app/models/api_key.rb` + migration
- Create: `app/controllers/api/v1/transcriptions_controller.rb`
- Create: `app/controllers/concerns/api_key_authenticatable.rb`
- Modify: `config/routes.rb`
- Create: `app/javascript/react/components/settings/ApiKeys.tsx`

### UI/UX Design Brief — API Keys

**Location:** "API" tab in Settings.

**Layout:**
- Description: "Use the Transcriber API to create and retrieve transcriptions from your own apps."
- API Keys table: name, key (masked: `sk-live-****abcd`), created date, last used, "Revoke" button
- "Create new key" → modal: name input + "Generate". Shows full key ONCE with copy button and warning "Store this key securely — it won't be shown again."
- Link to API documentation (Notion/Docs page)

**API endpoints (v1):**
- `POST /api/v1/transcriptions` — create (file upload or URL)
- `GET /api/v1/transcriptions` — list
- `GET /api/v1/transcriptions/:id` — get single
- `DELETE /api/v1/transcriptions/:id` — delete

- [ ] Create `api_keys` table: `account_id`, `name`, `token_digest`, `last_used_at`
- [ ] Create `ApiKey` model with `generate!` class method (returns plain token once)
- [ ] Create `ApiKeyAuthenticatable` concern for token-based auth
- [ ] Create `Api::V1::TranscriptionsController`
- [ ] Add API routes under `namespace :api, defaults: { format: :json } do; namespace :v1 do`
- [ ] Create `ApiKeys.tsx` settings tab
- [ ] Commit: `feat: public REST API with API key authentication`

---

## Task P5 — Webhook Notifications

**Files:**
- Create: `app/models/webhook.rb` + migration
- Create: `app/services/webhook_delivery_service.rb`
- Create: `app/sidekiq/deliver_webhook_worker.rb`
- Create: `app/javascript/react/components/settings/WebhookSettings.tsx`
- Modify: `app/models/transcription.rb` — trigger webhook on status change

### UI/UX Design Brief — Webhooks

**Location:** "Webhooks" tab in Settings.

**Layout:**
- Description + link to webhook event docs
- "Add endpoint" button → modal with URL input + events checkboxes:
  - ☑ transcription.completed
  - ☑ transcription.failed
  - ☐ transcription.created
- Endpoints table: URL, events, status (Active/Failing), last triggered, test button, edit, delete
- "Send test" → sends sample `transcription.completed` payload

**Payload format:**
```json
{
  "event": "transcription.completed",
  "data": {
    "id": 123,
    "title": "Interview with John",
    "status": "completed",
    "duration": 1820,
    "created_at": "2026-03-22T10:00:00Z"
  }
}
```

- [ ] Create `webhooks` table: `account_id`, `url`, `events` (array), `secret`, `active`
- [ ] Create `WebhookDeliveryService` with HMAC signature
- [ ] Create `DeliverWebhookWorker` Sidekiq job with retry and failure tracking
- [ ] Trigger webhook from `Transcription#after_status_change` callback
- [ ] Create `WebhookSettings.tsx`
- [ ] Commit: `feat: outbound webhook delivery for transcription events`

---

# POST-MVP PHASE v2 — Moat Features

## Task V1 — AI Q&A: Chat With Your Transcription

**Files:**
- Create: `app/controllers/ajax/transcription_chats_controller.rb`
- Create: `app/services/transcriptions/chat_service.rb`
- Create: `app/javascript/react/components/transcription/transcriptionShow/TranscriptionChat.tsx`
- Modify: `app/javascript/react/components/transcription/transcriptionShow/TranscriptionShow.tsx`

### UI/UX Design Brief — AI Chat

**Location:** Collapsible sidebar panel on the right side of the transcription detail page. Toggle with a chat bubble icon button in the header.

**Chat panel:**
```
┌──────────────────────────────┐
│ 💬 Ask about this transcript │
│                              │
│  [AI]  This interview covers │
│  budget planning for Q2...   │
│                              │
│  [You] What were the main    │
│  concerns raised?            │
│                              │
│  [AI]  Three main concerns   │
│  were mentioned: 1) Timeline │
│  2) Headcount 3) Tooling...  │
│                              │
│  [Type a question...    ] ▶  │
└──────────────────────────────┘
```

**Suggested starter questions** (shown when chat is empty):
- "Summarize the key decisions"
- "What action items were mentioned?"
- "Who was responsible for X?"

**AI response behavior:**
- Streamed response (character by character) using SSE or streaming fetch
- Citations: clicking a quoted segment jumps the audio player to that timestamp
- "Copy answer" icon on each AI message

**Context:** Sends full transcript text + conversation history to GPT-4o. Limits to last 10 exchanges + system prompt.

- [ ] Create `TranscriptionChat` controller with `create` action (accepts `message`, `history`)
- [ ] Create `ChatService` with OpenAI streaming support
- [ ] Create `TranscriptionChat.tsx` with message list, input, streaming render
- [ ] Add panel toggle to `TranscriptionShow.tsx`
- [ ] Add RTK mutation for `askTranscriptionQuestion`
- [ ] Commit: `feat: AI chat for transcription Q&A`

---

## Task V2 — Translation

**Files:**
- Modify: `app/controllers/ajax/transcriptions_controller.rb` — add `translate` action
- Create: `app/services/transcriptions/translator.rb`
- Create: `app/sidekiq/translate_transcription_worker.rb`
- Modify: `app/models/transcription.rb` — add `translations` jsonb column
- Modify: `TranscriptionShow.tsx` — add language selector for translations

### UI/UX Design Brief — Translation

**Entry:** "Translate" button in the transcription detail header. Opens a modal:
```
┌──────────────────────────────┐
│  Translate Transcript    ✕   │
│                              │
│  Source: English (auto)      │
│  Target: [Select language ▾] │
│                              │
│  [Cancel]   [Translate]      │
└──────────────────────────────┘
```

**After translation:** A language switcher tab bar appears above the transcript:
`[English] [Spanish] [French]`
Switching tabs shows the translated text (same segment structure, timestamps preserved).

**Export:** When a translated version is active, export (TXT/SRT/VTT) exports the translation.

- [ ] Add migration: `add_column :transcriptions, :translations, :jsonb, default: {}`
- [ ] Create `Transcriptions::Translator` using OpenAI GPT
- [ ] Create `TranslateTranscriptionWorker` Sidekiq job
- [ ] Add `translate` action to controller
- [ ] Update serializer to include available translations
- [ ] Add language tab switcher to `TranscriptionShow.tsx`
- [ ] Commit: `feat: multi-language translation for transcriptions`

---

## Task V3 — Email Notifications on Completion

**Files:**
- Create: `app/mailers/transcription_mailer.rb`
- Create: `app/views/transcription_mailer/completed.html.erb`
- Modify: `app/interactors/transcriptions/transcribe.rb` — enqueue mailer after completion
- Modify: `app/javascript/react/components/settings/Settings.tsx` — add notification preference toggle

### UI/UX Design Brief — Email Notifications

**Settings toggle:** In Settings → Profile section, add a toggle:
- "Email me when transcriptions complete" (default: on)

**Email design:**
- Subject: `Your transcription "[Title]" is ready`
- Body: Simple transactional layout. Shows title, duration, first 150 chars of transcript. CTA button: "View Transcription". Footer with unsubscribe link.

- [ ] Create `TranscriptionMailer` with `completed` action
- [ ] Design HTML email template
- [ ] Add `notify_on_completion` boolean column to `users`
- [ ] Enqueue mailer from `Transcriptions::Transcribe` after completion
- [ ] Add toggle in Settings.tsx
- [ ] Commit: `feat: email notification on transcription completion`

---

## Todo Tracker

### MVP Todos

- [ ] **M1** Fix audio URL hardcoded to localhost (`show_serializer.rb:23`)
- [ ] **M2** Settings: connect name update to backend API
- [ ] **M3** Settings: connect password change to backend API
- [ ] **M4** Export TXT / SRT / VTT
- [ ] **M5** Wire recent activity sidebar
- [ ] **M6** Speaker diarization (AssemblyAI)
- [ ] **M7** In-browser transcription editor
- [ ] **M8** AI-generated summary
- [ ] **M9** Public share link
- [ ] **M10** Batch file upload
- [ ] **M11** Full-text search within transcript content
- [ ] **M12** Mobile responsive audit & fix

### Post-MVP v1 Todos

- [ ] **P1** Team invitations & multi-member accounts
- [ ] **P2** Usage dashboard
- [ ] **P3** Billing & subscriptions (Stripe)
- [ ] **P4** Public REST API with API keys
- [ ] **P5** Webhook notifications

### Post-MVP v2 Todos

- [ ] **V1** AI Q&A: chat with your transcript
- [ ] **V2** Translation to other languages
- [ ] **V3** Email notifications on completion

---

## Effort Summary

| Task | Feature | Effort |
|---|---|---|
| M1 | Fix audio URL bug | XS (30 min) |
| M2 | Settings: name update | S (half day) |
| M3 | Settings: password change | S (half day) |
| M4 | Export TXT/SRT/VTT | S (1 day) |
| M5 | Recent activity sidebar | XS (1 hour) |
| M6 | Speaker diarization | M (2 days) |
| M7 | In-browser editor | L (4 days) |
| M8 | AI summary | M (2 days) |
| M9 | Public share link | M (2 days) |
| M10 | Batch upload | M (2 days) |
| M11 | Full-text search | M (1-2 days) |
| M12 | Mobile responsive | M (2 days) |
| P1 | Team invitations | L (5 days) |
| P2 | Usage dashboard | M (2 days) |
| P3 | Stripe billing | L (5 days) |
| P4 | REST API + API keys | L (5 days) |
| P5 | Webhooks | M (2 days) |
| V1 | AI Q&A chat | L (4 days) |
| V2 | Translation | M (3 days) |
| V3 | Email notifications | S (1 day) |

**MVP total: ~3–5 weeks**
**Post-MVP v1: ~3–4 weeks**
**Post-MVP v2: ~2 weeks**

---

## Effort Sizing Key

- **XS** < 2 hours
- **S** 2–8 hours (1 day)
- **M** 1–3 days
- **L** 3–7 days (1 week)
- **XL** 2–4 weeks
