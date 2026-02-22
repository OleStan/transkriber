# Transcriber Project Documentation

## Overview

**Transcriber** is a full-stack web application for audio and video transcription powered by OpenAI's Whisper API. The application allows users to upload audio/video files or provide URLs for transcription, with real-time progress tracking via WebSockets. Users can authenticate using Google OAuth, and all transcriptions are organized under user accounts.

## What This Application Does

1. **Upload & Process Media**: Users can upload audio/video files (MP3, MP4, WAV, WEBM, etc.) or provide URLs to media files
2. **Automatic Transcription**: Converts speech to text using OpenAI Whisper API with support for multiple languages
3. **Video-to-Audio Conversion**: Automatically converts video files to audio format using FFmpeg
4. **Real-time Progress Tracking**: WebSocket updates for transcription progress and status changes
5. **Transcription Management**: View, filter, search, and delete transcriptions with pagination
6. **Multi-language Support**: Auto-detection or manual language selection for transcription
7. **User Authentication**: Google OAuth integration with Devise for secure user management
8. **Account-based Organization**: Transcriptions can be organized by user accounts for team collaboration

---

## Technology Stack

### Backend
- **Ruby**: 3.3.9
- **Rails**: 7.2.2
- **Database**: PostgreSQL
- **Background Jobs**: Sidekiq 7.2
- **Authentication**: Devise 4.9 + OmniAuth (Google OAuth2)
- **File Storage**: ActiveStorage
- **API Communication**: ActionCable (WebSockets)
- **Business Logic**: ActiveInteractor (organizer pattern)

### Frontend
- **React**: 18.2.0
- **TypeScript**: 5.3.3
- **Build Tool**: Vite 5.0
- **State Management**:
  - Redux Toolkit 2.1.0 (RTK Query for API calls)
  - Zustand 4.5.2 (lightweight state)
- **UI Framework**: Material-UI (MUI Joy 5.0)
- **Routing**: React Router DOM 6.21.3
- **Audio Player**: Plyr 3.7.8
- **HTTP Client**: Axios 1.9.0

### Services & APIs
- **OpenAI**: Whisper API for transcription
- **Google Cloud Speech**: Alternative speech-to-text service
- **FFmpeg**: Audio/video processing and conversion

### DevOps & Tools
- **Asset Pipeline**: Vite Rails (vite_rails, vite_ruby)
- **Job Queue**: Redis 4.0 (for Sidekiq)
- **CORS**: rack-cors
- **Environment Variables**: Figaro
- **Pagination**: Kaminari

---

## Database Schema

### Main Tables

#### `users`
- Authentication with Devise
- OAuth provider info (Google)
- Belongs to an `account`
- Fields: `email`, `first_name`, `last_name`, `avatar`, `provider`, `uid`, `admin`

#### `accounts`
- Multi-tenant structure
- Has many `users` and `transcriptions`
- Fields: `name`

#### `transcriptions`
- Core entity storing transcription data
- Belongs to `user` and `account` (both optional)
- Has one attached `audio` file (via ActiveStorage)
- Fields:
  - `title`: Display name
  - `transcription`: Full text result
  - `transcription_json`: Detailed segments with timestamps
  - `status`: Enum (pending, uploading, processing, in_progress, transcribing, post_processing, completed, failed, cancelled)
  - `duration`: Audio duration in seconds
  - `progress`: 0-100 percentage
  - `error_message`: Error details if failed

---

## Backend Architecture

### Controllers

#### `Ajax::TranscriptionsController`
Main API controller for transcription CRUD operations:
- **index**: List transcriptions with filtering (status, search, date range, file type) and pagination
- **show**: Get single transcription details
- **create**: Upload file or URL for transcription
- **destroy**: Delete transcription

#### `Api::SessionsController`
Handles user session management for API authentication

#### `Users::OmniauthCallbacksController`
Handles Google OAuth callbacks for user authentication

#### `PagesController`
Serves the React SPA for all routes

### Interactors (Business Logic Layer)

All transcription workflows use the **ActiveInteractor** pattern for composable, testable business logic:

#### `Transcriptions::Create`
Organizer that orchestrates transcription creation:
1. Validates audio file or URL
2. Converts video to audio if needed (via `ConvertVideoToAudio`)
3. Creates transcription record (via `CreateTranscription`)
4. Enqueues background job for processing

#### `Transcriptions::Transcribe`
Core transcription logic:
1. Updates progress (0% - transcribing)
2. Calls OpenAI Whisper service with progress callbacks
3. Stores result (text + JSON segments)
4. Updates progress (100% - completed)
5. Broadcasts completion via WebSocket

#### `Transcriptions::Delete`
Handles transcription deletion and returns updated list

#### `Transcriptions::Index`
Fetches filtered and paginated transcriptions with support for:
- Status filtering
- Search by title
- Date range filtering
- File type filtering (audio/video)

#### `Transcriptions::FetchMedia`
Downloads media from URLs for transcription

#### `Transcriptions::AttachAudio`
Attaches audio file to transcription record

#### `Transcriptions::ConvertVideoToAudio`
Converts video files to audio format using FFmpeg

### Services

#### `OpenAiWhisperService`
Primary transcription service:
- Handles large files by splitting into chunks (24MB segments)
- Supports multiple audio formats
- Progress tracking with callbacks
- Retry logic with exponential backoff (3 attempts)
- Returns text or verbose JSON with timestamps

**Key Features**:
- Chunk processing for files > 24MB
- FFmpeg-based audio splitting
- Progress reporting (0-100%)
- Error handling with detailed logging

#### `AudioProcessing::DurationCalculator`
Calculates audio/video duration using FFmpeg

#### `MediaDownloadService`
Downloads media from URLs for processing

#### `VideoToAudioService`
Converts video files to audio format

### Background Jobs

#### `TranscribeAudioWorker`
Sidekiq worker that:
1. Processes URL downloads if URL provided
2. Updates progress during media fetch
3. Calls `Transcriptions::Transcribe` interactor
4. Handles errors and updates transcription status
5. Broadcasts real-time updates via ActionCable

**Queue**: `transcriptions`
**Retry Strategy**: Exponential backoff, 3 attempts
**Error Handling**: Discards on `OpenAiError`, retries on other errors

### Models & Concerns

#### `Transcription` Model
Key methods:
- `owned_by?(user)`: Check ownership
- `update_progress(percentage, status)`: Update and broadcast progress
- `record_error(message)`: Set failed status and broadcast error
- `broadcast_progress_update`: Send WebSocket updates
- `transcribe_audio`: Trigger OpenAI service

Scopes:
- `accessible_by(user)`: All transcriptions user can access
- `completed`, `in_progress`, `failed`: Filter by status
- `search_by_title(query)`: Full-text search
- `with_file_type(type)`: Filter audio/video
- `created_between(start, end)`: Date range filtering

#### `User` Model
- Devise authentication with OmniAuth
- `from_omniauth(auth)`: OAuth callback handler
- Auto-creates account on OAuth signup

#### `Account` Model
- Simple container for users and transcriptions
- Multi-tenancy support

---

## Frontend Architecture

### Routes

Defined in [app/javascript/react/routes/routes.tsx](app/javascript/react/routes/routes.tsx):

**Public Routes**:
- `/login` - User login
- `/signup` - User registration

**Protected Routes** (require authentication):
- `/` or `/home` - Home dashboard
- `/transcriptions` - Transcriptions list
- `/transcriptions/:id` - Transcription detail view
- `/settings` - User settings

### Main Components

#### Layout Components

**[NavBar.tsx](app/javascript/react/components/layout/NavBar.tsx)**
- Top navigation bar with logo and user menu
- Dark theme toggle
- Links to home, transcriptions, settings

**[SideBar.tsx](app/javascript/react/components/layout/SideBar.tsx)**
- Left sidebar navigation (if present)

**[Header.tsx](app/javascript/react/components/layout/Header.tsx)**
- Page header component

**[ColorSchemeToggle.tsx](app/javascript/react/components/layout/ColorSchemeToggle.tsx)**
- Dark/light mode switcher

#### Home Page Components

**[Home.tsx](app/javascript/react/components/home/Home.tsx)**
- Main dashboard view
- Shows `QuickAddFileOrUrl` component
- Displays recent transcriptions table
- WebSocket subscriptions for active transcriptions
- Real-time status updates

**[QuickAddFileOrUrl.tsx](app/javascript/react/components/home/QuickAddFile/QuickAddFileOrUrl.tsx)**
- Tabbed interface for file upload or URL input
- Drag-and-drop file upload
- Language selection with localStorage persistence
- Form validation and submission
- Progress indicators during upload
- Creates transcription via RTK Query mutation

**[LanguageSelector.tsx](app/javascript/react/components/home/QuickAddFile/LanguageSelector.tsx)**
- Dropdown for selecting transcription language
- Auto-detect option

**[RecentTranscriptionsTable.tsx](app/javascript/react/components/home/RecentTranscriptionsTable.tsx)**
- Shows recent transcriptions on home page

#### Transcription Components

**[Transcriptions.tsx](app/javascript/react/components/transcription/Transcriptions.tsx)**
- Full transcriptions list page
- Filtering, search, pagination

**[TranscriptionShow.tsx](app/javascript/react/components/transcription/transcriptionShow/TranscriptionShow.tsx)**
- Detailed view of a single transcription
- Audio player integration
- Segment-by-segment display with timestamps
- Loader function for React Router data fetching

**[TranscriptionShowTranscription.tsx](app/javascript/react/components/transcription/transcriptionShow/TranscriptionShowTranscription.tsx)**
- Displays transcription text with segments

**[AdjustSegmentSizeSlider.tsx](app/javascript/react/components/transcription/transcriptionShow/AdjustSegmentSizeSlider.tsx)**
- Controls segment size display

**[TranscriptionShowSkeleton.tsx](app/javascript/react/components/transcription/transcriptionShow/TranscriptionShowSkeleton.tsx)**
- Loading skeleton for transcription view

**[TranscriptionSegmentsSkeleton.tsx](app/javascript/react/components/transcription/transcriptionShow/TranscriptionSegmentsSkeleton.tsx)**
- Loading skeleton for segments

#### Transcription Table Components

**[TranscriptionsTable.tsx](app/javascript/react/components/transcription/transcriptionsTable/TranscriptionsTable.tsx)**
- Main table component for listing transcriptions

**[TranscriptionsTableBase.tsx](app/javascript/react/components/transcription/transcriptionsTable/TranscriptionsTableBase.tsx)**
- Base table with virtualization

**[StyledTranscriptionsTable.tsx](app/javascript/react/components/transcription/transcriptionsTable/StyledTranscriptionsTable.tsx)**
- Styled wrapper for transcriptions table

#### Authentication Components

**[Login.tsx](app/javascript/react/components/auth/Login.tsx)**
- User login form
- Google OAuth button

**[Signup.tsx](app/javascript/react/components/auth/Signup.tsx)**
- User registration form

**[ProtectedRoute.tsx](app/javascript/react/components/auth/ProtectedRoute.tsx)**
- Route guard for authenticated routes
- Redirects to login if not authenticated

#### Other Components

**[AudioPlayer.tsx](app/javascript/react/components/player/AudioPlayer.tsx)**
- Audio playback with Plyr
- Timestamp seeking

**[Settings.tsx](app/javascript/react/components/settings/Settings.tsx)**
- User settings page

### State Management

#### Redux Store

**[store.ts](app/javascript/react/app/store.ts)**
- Configures Redux store with RTK Query

#### RTK Query API Slices

**[transcriptionsSlice.ts](app/javascript/react/redux/resourcesApi/transcriptions/transcriptionsSlice.ts)**

Endpoints:
- `getTranscription(id)`: Fetch single transcription
- `getTranscriptions(params)`: Fetch paginated list with filters
  - Parameters: `page`, `status`, `q` (search), `start_date`, `end_date`, `type`
- `createTranscription(formData)`: Upload and create transcription
- `deleteTranscription(id)`: Delete transcription

Auto-generated hooks:
- `useGetTranscriptionQuery`
- `useGetTranscriptionsQuery`
- `useCreateTranscriptionMutation`
- `useDeleteTranscriptionMutation`

**[authSlice.ts](app/javascript/react/redux/resourcesApi/auth/authSlice.ts)**
- Authentication endpoints

**[transcriberService.ts](app/javascript/react/redux/resourcesApi/transcriberService.ts)**
- Base API configuration for RTK Query

#### Contexts

**[AuthContext.tsx](app/javascript/react/contexts/AuthContext.tsx)**
- User authentication state

**[NotificationContext.tsx](app/javascript/react/contexts/NotificationContext.tsx)**
- Toast notifications across the app

### WebSocket Integration

**[cable.ts](app/javascript/react/lib/cable.tsx)**
- ActionCable connection setup
- Used for real-time transcription updates

**WebSocket Channels**:
- `TranscriptionChannel`: Receives progress updates, status changes, completion notifications

---

## Key Workflows

### 1. File Upload & Transcription

1. **User uploads file** via `QuickAddFileOrUrl` component
2. **Frontend** calls `createTranscription` mutation (RTK Query)
3. **Backend** `Ajax::TranscriptionsController#create` receives request
4. **Interactor** `Transcriptions::Create` orchestrates:
   - Validates file format
   - Converts video to audio if needed
   - Creates transcription record (status: `in_progress`)
5. **Background job** `TranscribeAudioWorker` enqueued
6. **Worker** calls `Transcriptions::Transcribe` interactor:
   - Calls `OpenAiWhisperService` with progress callbacks
   - Updates progress via WebSocket (0% → 100%)
   - Stores transcription text and JSON segments
7. **Frontend** receives WebSocket updates and refreshes UI
8. **Completion** broadcast triggers status change to `completed`

### 2. URL-based Transcription

1. **User enters URL** in `QuickAddFileOrUrl` component
2. **Transcription created** with status `uploading`
3. **Worker** downloads media via `Transcriptions::FetchMedia`
4. **Progress updates** during download (5% → 30%)
5. **Audio attached** and duration calculated
6. **Transcription flow continues** as in file upload (step 6-8 above)

### 3. Real-time Progress Tracking

1. **Frontend subscribes** to `TranscriptionChannel` for active transcriptions
2. **Backend services** call `transcription.update_progress(percentage, status)`
3. **Model method** broadcasts update via ActionCable
4. **Frontend receives** WebSocket message and updates UI reactively
5. **Progress displayed** in tables, cards, and detail views

### 4. Authentication Flow

1. **User clicks** "Sign in with Google"
2. **OAuth redirect** to Google authorization
3. **Callback** to `Users::OmniauthCallbacksController`
4. **User model** `from_omniauth` method:
   - Creates or updates user
   - Auto-creates account if new user
5. **Session created**, user redirected to home page

### 5. Transcription Filtering & Search

1. **User applies filters** (status, date range, file type, search query)
2. **Frontend** updates query params for `useGetTranscriptionsQuery`
3. **Backend** `Transcriptions::Index` interactor:
   - Applies scopes based on filters
   - Uses `Transcriptions::Filterable` concern
   - Paginates results with Kaminari
4. **Response** includes transcriptions and pagination metadata
5. **UI updates** table with filtered results

---

## Development Commands

### Backend
```bash
# Install dependencies
bundle install

# Database setup
rails db:create db:migrate

# Start Rails server
rails s

# Start Sidekiq worker
bundle exec sidekiq

# Start dev server with Vite
bin/vite dev
```

### Frontend
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build
```

### Full Stack Development
```bash
# Start all services (Rails + Vite + Sidekiq)
bin/dev  # or foreman start -f Procfile.dev
```

---

## Environment Variables (Figaro)

Required in `config/application.yml`:
- `OPENAI_API_KEY`: OpenAI API key for Whisper
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `REDIS_URL`: Redis connection for Sidekiq (optional, defaults to localhost)

---

## Code Organization Patterns

### Backend
- **Controllers**: Thin layer, delegates to interactors
- **Interactors**: Business logic with ActiveInteractor pattern
- **Services**: External API integrations (OpenAI, FFmpeg)
- **Models**: Data validation and scopes
- **Serializers**: JSON response formatting (ActiveModelSerializers)

### Frontend
- **Components**: Organized by feature (auth, home, transcription, layout)
- **State**: RTK Query for server state, Zustand for UI state
- **Hooks**: Custom hooks in contexts for reusable logic
- **Types**: TypeScript interfaces in `types.ts` files

---

## Testing Strategy

### Backend
- **RSpec** (likely setup, gem included)
- **Faker** for test data generation

### Frontend
- ESLint + Prettier for code quality
- TypeScript for type safety

---

## Recent Changes (from git commits)

1. **Ruby upgrade** to 3.3.9
2. **File type filtering** added to transcriptions
3. **Dark theme redesign** with improved UI
4. **User authentication** with OAuth
5. **Duration calculation** fixes for transcriptions

---

## Future Considerations

- Add tests (RSpec for backend, Jest/Vitest for frontend)
- Implement transcription editing
- Export transcriptions (SRT, VTT formats)
- Add speaker diarization
- Support more transcription providers
- Team collaboration features
- Usage analytics and quotas
- Webhook notifications

---

## Key Files Reference

### Backend
- [Transcription Model](app/models/transcription.rb:1)
- [User Model](app/models/user.rb:1)
- [OpenAI Whisper Service](app/services/open_ai_whisper_service.rb:1)
- [Transcribe Interactor](app/interactors/transcriptions/transcribe.rb:1)
- [Create Interactor](app/interactors/transcriptions/create.rb:1)
- [Transcribe Worker](app/sidekiq/transcribe_audio_worker.rb:1)
- [Ajax Transcriptions Controller](app/controllers/ajax/transcriptions_controller.rb:1)
- [Routes](config/routes.rb:1)

### Frontend
- [Main Entry](app/javascript/react/main.tsx:1)
- [Routes](app/javascript/react/routes/routes.tsx:1)
- [Home Component](app/javascript/react/components/home/Home.tsx:1)
- [QuickAddFileOrUrl](app/javascript/react/components/home/QuickAddFile/QuickAddFileOrUrl.tsx:1)
- [Transcriptions Slice](app/javascript/react/redux/resourcesApi/transcriptions/transcriptionsSlice.ts:1)
- [Transcription Show](app/javascript/react/components/transcription/transcriptionShow/TranscriptionShow.tsx:1)

---

**Last Updated**: 2026-02-20
**Version**: Ruby 3.3.9, Rails 7.2.2, React 18.2.0
