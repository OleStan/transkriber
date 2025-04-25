# frozen_string_literal: true

class Transcription < ApplicationRecord
  belongs_to :account, optional: true
  has_one_attached :audio, dependent: :destroy

  enum status: { pending: 'pending', in_progress: 'in_progress', completed: 'completed', failed: 'failed' }
  # validates :audio, attached: true, content_type: ['audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/m4a', 'audio/wav', 'audio/webm']
  # default_scope { order(created_at: :desc) }

  paginates_per 10

  def audio_on_disk
    ActiveStorage::Blob.service.path_for(audio.key)
  end

  def transcribe_audio
    OpenAiWhisperService.call(audio.blob)
  end

  private

  def raw_command_to_system
    language = 'Ukrainian'
    filename = ''
    model = 'medium'
    "whisper #{filename} --model #{model} --language #{language}"
  end
end
