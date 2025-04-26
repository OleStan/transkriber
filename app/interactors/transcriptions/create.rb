# frozen_string_literal: true

class Transcriptions::CreateContext < ActiveInteractor::Context::Base
  attributes :audio, :url, :language
  attributes :audio_transcription, :io, :filename, :create_params

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
  VIDEO_EXTENSIONS = %w[mp4 webm mov mpeg].freeze

  before_perform :set_create_params
  after_perform :transcribe_audio, if: -> { context.success? }

  organize do
    # add Transcriptions::FetchMedia
    add Transcriptions::ConvertVideoToAudio, if: -> { needs_video_conversion? }
    add Transcriptions::CreateTranscription
  end

  private

  def set_create_params
    context.create_params = if context.url.present?
                              { title: context.url, status: :uploading }
                            else
                              {
                                audio: { io: context.audio.tempfile, filename: context.audio.original_filename },
                                title: File.basename(context.audio.original_filename, '.*'),
                                duration: AudioProcessing::DurationCalculator.calculate(
                                  context.audio.tempfile.respond_to?(:path) ? context.audio.tempfile.path : Tempfile.new.path
                                ),
                                status: :in_progress
                              }
                            end
  end

  def transcribe_audio
    TranscribeAudioWorker.perform_later(context.audio_transcription.id, context.url, context.language)

    # TranscribeAudioWorker.new.perform(context.audio_transcription.id, context.language)
  end

  def needs_video_conversion?
    context.filename.present? && VIDEO_EXTENSIONS.include?(File.extname(context.filename).delete('.').downcase)
  end
end
