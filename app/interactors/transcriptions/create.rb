# frozen_string_literal: true

class Transcriptions::CreateContext < ActiveInteractor::Context::Base
  attributes :audio, :url, :language
  attributes :audio_transcription, :io, :filename

  validate :audio_or_url_present
  validate :audio_format_validation, if: -> { audio.present? }

  private

  def audio_or_url_present
    return if audio.present? || url.present?

    errors.add(:base, 'Audio file or URL must be provided')
  end

  def audio_format_validation
    allowed_formats = %w[mp3 mp4 mpeg mpga m4a wav webm mov]
    ext = File.extname(audio.original_filename).delete('.').downcase
    return if allowed_formats.include?(ext)

    errors.add(:audio, 'format is not supported')
  end
end

class Transcriptions::Create < ActiveInteractor::Organizer::Base
  after_perform :transcribe_audio, if: -> { context.success? }

  organize do
    add Transcriptions::FetchMedia
    add Transcriptions::ConvertVideoToAudio
    add Transcriptions::CreateTranscription
  end

  private

  def transcribe_audio
    TranscribeAudioWorker.perform_later(context.audio_transcription.id, context.language)
  end
end
