# Transcriber — Product Review & Roadmap

> Last updated: 2026-03-22

---

## 1. What's Implemented (v1 Feature Set)

### Core Transcription Engine
| Feature | Status | Notes |
|---|---|---|
| File upload (mp3, mp4, wav, webm, mov, m4a, mpeg) | ✅ Done | Validated by extension |
| URL-based transcription | ✅ Done | Generic URLs + YouTube via yt-dlp |
| OpenAI Whisper API integration | ✅ Done | Chunked for files > 24MB |
| Video-to-audio conversion | ✅ Done | FFmpeg-based |
| Background processing via Sidekiq | ✅ Done | Retry x3, exponential backoff |
| Transcription cancellation | ✅ Done | Via WebSocket cancel message |
| Multi-language support | ✅ Done | Auto-detect or manual selection |
| Segment timestamps (JSON) | ✅ Done | Word/phrase-level segments stored |

### Real-time & UX
| Feature | Status | Notes |
|---|---|---|
| WebSocket progress tracking (0–100%) | ✅ Done | ActionCable channel |
| Drag-and-drop file upload | ✅ Done | |
| Audio player with timestamp seeking | ✅ Done | Plyr integration |
| Adjustable segment size display | ✅ Done | Slider control |
| Dark/light theme toggle | ✅ Done | Persisted via MUI Joy |

### Data Management
| Feature | Status | Notes |
|---|---|---|
| Transcription list with pagination | ✅ Done | 10 per page, Kaminari |
| Filter by status | ✅ Done | All status values |
| Filter by date range | ✅ Done | |
| Filter by file type (audio/video) | ✅ Done | |
| Search by title | ✅ Done | ILIKE full-text search |
| Delete transcription | ✅ Done | With ownership check |
| Copy transcription text | ✅ Done | |

### Authentication & Accounts
| Feature | Status | Notes |
|---|---|---|
| Email/password auth (Devise) | ✅ Done | |
| Google OAuth2 login | ✅ Done | |
| Auto-create account on signup | ✅ Done | |
| Protected routes | ✅ Done | |
| Account-based transcription ownership | ✅ Done | Backend scopes |

---

## 2. Partially Implemented (In Progress)

| Feature | Status | Location | What's Missing |
|---|---|---|---|
| Settings — profile update (name) | 🟡 UI only | `Settings.tsx:65` | Backend endpoint + API call |
| Settings — password change | 🟡 UI only | `Settings.tsx:120` | Backend endpoint + API call |
| Download transcription | 🟡 Stubbed | `StyledTranscriptionsTable.tsx:67` | Export logic (TXT/SRT/VTT) |
| Recent activity sidebar | 🟡 Empty | `SidebarRecentActivity.tsx:10` | Data wiring |
| Audio URL in production | 🟡 Hardcoded | `show_serializer.rb:23` | Use `ENV['HOST']` |
| Google Speech-to-Text | 🟡 Coded | `google_speech_to_text_service.rb` | Not wired to workflow |
| Account management UI | 🟡 API only | `ajax/accounts_controller.rb` | No frontend |

---

## 3. Not Implemented (Backlog)

- Export to SRT / VTT / TXT formats
- Transcription editing (correct mistakes)
- Speaker diarization
- Team invitations and role management (admin/member)
- Usage quotas and billing
- Webhook / API for external integrations
- Transcription search within text (not just title)
- Batch upload (multiple files at once)
- Email/Slack notifications on completion
- Transcription sharing (public link)
- Mobile-responsive design audit

---

## 4. Market Analysis — Competitor Landscape

### Competitor Overview

| Product | Focus | Price (entry paid) | Differentiator |
|---|---|---|---|
| **Otter.ai** | Meeting notes, team collab | $8.33/mo | Zoom/Meet/Teams native bot, AI summaries |
| **Descript** | Video/podcast editing | $16/mo | Text-based video editing, Underlord AI |
| **Fireflies.ai** | Meeting intelligence | $10/seat/mo | CRM integrations, conversation analytics |
| **Rev.com** | Legal/compliance | $25.49/seat/mo | Human transcription fallback, HIPAA/CJIS |
| **AssemblyAI** | Developer API | $0.15/hr pay-as-you-go | 99 languages, speaker diarization, NLP features |
| **Sonix** | Media production | $5/hr (premium) | 53+ languages, in-browser editor, translation |
| **Deepgram** | Real-time voice AI | Custom | Lowest latency streaming, custom models |
| **Grain** | Revenue/sales teams | Freemium | Call coaching, CRM sync, highlight clips |

### Market Segments

```
┌─────────────────────────────────────────────────────────────┐
│                    TRANSCRIPTION MARKET                      │
│                                                              │
│  Meeting / Collab      Media Production      Developer API   │
│  ─────────────────     ────────────────      ─────────────  │
│  Otter.ai              Descript              AssemblyAI      │
│  Fireflies.ai          Sonix                 Deepgram        │
│  Grain                 Rev.com (media)       OpenAI Whisper  │
│                                                              │
│  Legal / Compliance    General Purpose                       │
│  ──────────────────    ───────────────                       │
│  Rev.com               [← Transcriber sits here]            │
│  Verbit                                                      │
└─────────────────────────────────────────────────────────────┘
```

### What Competitors Do Well That We Don't
1. **Export formats** — every paid competitor offers SRT/VTT/TXT/DOCX export
2. **In-browser editor** — Sonix, Descript, Rev all let you correct transcription text inline
3. **Speaker diarization** — AssemblyAI, Sonix, Descript all identify speakers
4. **Sharing** — public/private share links for collaborators
5. **Batch upload** — Sonix, Rev allow multiple files at once
6. **Search within transcription text** — not just title, but full-text content search
7. **AI summaries / chapters** — Otter, Fireflies, Grain all generate structured summaries
8. **Mobile apps** — most competitors have iOS/Android apps

### Gaps / Opportunities
- **No dominant "general purpose" open API** player with a clean SaaS UI
- **Privacy-first niche**: most competitors route through US servers — self-hosted / GDPR-first is underserved
- **Per-minute pricing** is more accessible than per-seat for individuals
- **Embedded audio player synced to transcript** is still poorly done by most competitors
- **Podcast / content creator workflow** (chapters, show notes, social clips) is a growing niche

---

## 5. Product Roadmap

### Priority Framework
- **P0** — Blocking (must-have for any real use)
- **P1** — Core value (differentiates from free tools)
- **P2** — Growth (drives retention and expansion)
- **P3** — Moat (hard to copy, builds loyalty)

---

### Phase 1 — Polish v1 (1–2 weeks)
*Goal: Make existing features production-ready*

| # | Feature | Priority | Effort |
|---|---|---|---|
| 1.1 | Fix audio URL hardcoded to localhost | P0 | XS |
| 1.2 | Settings page — connect name/password update to API | P0 | S |
| 1.3 | Export transcript as TXT | P0 | S |
| 1.4 | Export transcript as SRT (with timestamps) | P1 | S |
| 1.5 | Export transcript as VTT | P1 | XS |
| 1.6 | Wire recent activity sidebar | P1 | XS |
| 1.7 | Full-text search within transcription content | P1 | M |
| 1.8 | Responsive mobile layout audit | P1 | M |

---

### Phase 2 — Core Value (3–5 weeks)
*Goal: Match table stakes of paid competitors*

| # | Feature | Priority | Effort |
|---|---|---|---|
| 2.1 | In-browser transcription editor (correct mistakes) | P1 | L |
| 2.2 | Speaker diarization (via AssemblyAI or Whisper diarization) | P1 | M |
| 2.3 | AI-generated summary (key points, action items) | P1 | M |
| 2.4 | Public share link for transcription | P1 | M |
| 2.5 | Batch file upload (multiple files queued) | P1 | M |
| 2.6 | Email notification on transcription completion | P2 | S |
| 2.7 | Transcription title auto-generation from content | P2 | S |
| 2.8 | Chapter / topic detection (AI-based) | P2 | M |

---

### Phase 3 — Growth & Retention (6–10 weeks)
*Goal: Build user stickiness and team features*

| # | Feature | Priority | Effort |
|---|---|---|---|
| 3.1 | Team management — invite members to account | P2 | L |
| 3.2 | Role-based access (admin / viewer / editor) | P2 | M |
| 3.3 | Usage dashboard (minutes used, quota remaining) | P2 | M |
| 3.4 | Webhook support (POST to URL on completion) | P2 | M |
| 3.5 | REST API with API key auth (for external integrations) | P2 | L |
| 3.6 | Slack notification integration | P3 | S |
| 3.7 | Zapier / Make.com webhook trigger | P3 | S |
| 3.8 | Translation (transcription → target language) | P3 | M |

---

### Phase 4 — Moat Features (10+ weeks)
*Goal: Build unique differentiation*

| # | Feature | Priority | Effort |
|---|---|---|---|
| 4.1 | AI Q&A — chat with your transcription | P2 | L |
| 4.2 | Podcast workflow — chapters, show notes, social clips | P3 | XL |
| 4.3 | Custom vocabulary / fine-tuning per account | P3 | L |
| 4.4 | Billing & subscription management (Stripe) | P2 | L |
| 4.5 | Self-hosted / on-prem option (privacy-first) | P3 | XL |
| 4.6 | Mobile app (iOS/Android) | P3 | XL |
| 4.7 | Real-time live transcription (microphone stream) | P3 | XL |

---

## 6. Recommended Next Steps

**This week (quick wins):**
1. Fix the `localhost` URL bug in `show_serializer.rb:23`
2. Add TXT + SRT export (unlocks a core use case)
3. Connect Settings page to backend API
4. Wire the recent activity sidebar

**This month (v1.5 milestone):**
- In-browser editor for correcting transcript
- Speaker diarization (via AssemblyAI as alternative provider)
- AI summary generation
- Share links

**Strategic bet:**
The biggest untapped opportunity is **"chat with your transcript"** (AI Q&A over the transcription content). Competitors are starting to add this but execution is poor. Combined with a clean segment player and good editor, this becomes a strong retention hook.

---

## Effort Sizing Key
- **XS** < 2 hours
- **S** 2–8 hours (1 day)
- **M** 1–3 days
- **L** 3–7 days (1 week)
- **XL** 2–4 weeks
