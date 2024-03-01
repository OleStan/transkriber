# frozen_string_literal: true

class Transcriptions::CreateContext < ActiveInteractor::Context::Base
  attributes :audio, :language
  validates :audio, presence: true
  validate :audio_format_validation

  attributes :audio_transcription

  private

  def audio_format_validation
    return if audio.blank?

    allowed_formats = %w[mp3 mp4 mpeg mpga m4a wav webm]

    unless allowed_formats.include?(File.extname(audio.original_filename).delete('.').downcase)
      errors.add(:audio, 'format is not supported')
    end
  end
end

# TODO: Make it Transaction Defered interactor
class Transcriptions::Create < ActiveInteractor::Base
  after_perform :transcribe_audio, if: -> { context.success? }

  def perform
    create_transcription
    build_data
  end

  private

  delegate :audio, :audio_transcription, :language, to: :context

  def create_transcription
    context.audio_transcription = Transcription.create!(transcription_params)
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(e.message)
  end

  def build_data
    context.data = {
      transcription_id: audio_transcription.id,
    }
  end

  def transcription_params
    {
      audio:,
      title: audio_file_name,
      duration: audio_duration
    }
  end

  def audio_file_name
    File.basename(context.audio.original_filename, '.*') if context.audio.respond_to?(:original_filename)
  end

  def audio_duration
    AudioProcessing::DurationCalculator.calculate(context.audio)
  end

  def transcribe_audio
    # TranscribeAudioWorker.perform_async(audio_transcription.id, language) # TODO: Setup Sidekiq
    TranscribeAudioWorker.perform_later(audio_transcription.id, language)
  end
end
