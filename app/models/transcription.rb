# frozen_string_literal: true

class Transcription < ApplicationRecord
  include Transcriptions::Filterable
  belongs_to :account, optional: true
  belongs_to :user, optional: true
  has_one_attached :audio, dependent: :destroy

  # Scopes for easier querying
  # Basic ownership scopes
  scope :for_user, ->(user) { where(user_id: user.id) }
  scope :for_account, ->(account) { where(account_id: account.id) }

  # Combined scope for all transcriptions accessible by a user
  # (either created by them or belongs to their account)
  scope :accessible_by, lambda { |user|
    return none unless user.present?

    # Early return with optimized query
    if user.account_id.present?
      where('transcriptions.user_id = :user_id OR transcriptions.account_id = :account_id',
            user_id: user.id, account_id: user.account_id)
    else
      where(user_id: user.id)
    end
  }

  # Status-based scopes
  scope :completed, -> { where(status: :completed) }
  scope :in_progress, -> { where(status: %i[in_progress uploading processing transcribing post_processing]) }
  scope :failed, -> { where(status: :failed) }
  scope :pending, -> { where(status: :pending) }
  scope :with_status, ->(status) { where(status: status) if status.present? }

  # Date-based scopes
  scope :created_after, ->(date) { where('transcriptions.created_at >= ?', date) if date.present? }
  scope :created_before, ->(date) { where('transcriptions.created_at <= ?', date) if date.present? }
  scope :created_between, lambda { |start_date, end_date|
    created_after(start_date).created_before(end_date)
  }
  scope :recent, ->(days = 7) { where('transcriptions.created_at >= ?', days.days.ago) }

  # Search scopes
  scope :search_by_title, lambda { |query|
    where('transcriptions.title ILIKE ?', "%#{sanitize_sql_like(query)}%") if query.present?
  }

  # File type scopes
  scope :with_file_type, lambda { |type|
    return all unless type.present?

    case type.downcase
    when 'audio'
      # Match common audio file extensions
      joins(:audio_attachments)
        .joins('INNER JOIN active_storage_blobs ON active_storage_blobs.id = active_storage_attachments.blob_id')
        .where('active_storage_blobs.filename ILIKE ANY(ARRAY[?])',
               ['%.mp3', '%.wav', '%.ogg', '%.m4a', '%.aac', '%.flac', '%.wma', '%.aiff'])
    when 'video'
      # Match common video file extensions
      joins(:audio_attachments)
        .joins('INNER JOIN active_storage_blobs ON active_storage_blobs.id = active_storage_attachments.blob_id')
        .where('active_storage_blobs.filename ILIKE ANY(ARRAY[?])',
               ['%.mp4', '%.avi', '%.mov', '%.mkv', '%.webm', '%.flv', '%.wmv', '%.m4v'])
    else
      all
    end
  }

  

  # Check if a user owns this transcription either directly or through their account
  def owned_by?(user)
    return false unless user

    # Early returns for performance
    return true if user_id.present? && user_id == user.id
    return true if account_id.present? && user.account_id.present? && account_id == user.account_id

    false
  end

  enum status: {
    pending: 'pending',
    uploading: 'uploading',
    processing: 'processing', # For audio conversion
    in_progress: 'in_progress',
    transcribing: 'transcribing', # Actual transcription in progress
    post_processing: 'post_processing', # Any cleanup/formatting
    completed: 'completed',
    failed: 'failed',
    cancelled: 'cancelled'
  }
  # validates :audio, attached: true, content_type: ['audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/m4a', 'audio/wav', 'audio/webm']
  # default_scope { order(created_at: :desc) }

  paginates_per 10

  def audio_on_disk
    ActiveStorage::Blob.service.path_for(audio.key)
  end

  def transcribe_audio
    OpenAiWhisperService.call(audio.blob)
  end

  # Update progress and broadcast to WebSocket
  def update_progress(percentage, current_status = nil)
    # Ensure percentage is between 0-100
    percentage = [[percentage.to_i, 0].max, 100].min

    # Update record with new progress
    update(progress: percentage)

    # Update status if provided
    update(status: current_status) if current_status.present?

    # Broadcast progress update
    broadcast_progress_update
  end

  # Record error and broadcast failure
  def record_error(message)
    update(
      error_message: message,
      status: :failed
    )
    broadcast_error
  end

  # Reset for retry
  def reset_for_retry
    update(
      status: :pending,
      progress: 0,
      error_message: nil
    )
  end

  # Broadcast current progress to WebSocket channel
  def broadcast_progress_update
    ActionCable.server.broadcast(
      "transcription_channel_#{id}",
      {
        status: status,
        progress: progress,
        id: id
      }
    )
  end

  # Broadcast error to WebSocket channel
  def broadcast_error
    ActionCable.server.broadcast(
      "transcription_channel_#{id}",
      {
        status: :failed,
        progress: progress,
        error: error_message,
        id: id
      }
    )
  end

  private

  def raw_command_to_system
    language = 'Ukrainian'
    filename = ''
    model = 'medium'
    "whisper #{filename} --model #{model} --language #{language}"
  end
end
