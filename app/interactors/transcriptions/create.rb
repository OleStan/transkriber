# frozen_string_literal: true

class Transcriptions::CreateContext < ActiveInteractor::Context::Base
  attributes :audio, :url, :language, :user, :account
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
  VIDEO_EXTENSIONS = %w[mp4 webm mov mpeg].freeze

  before_perform :set_audio_context, if: -> { context.audio.present? }
  after_perform :transcribe_audio, if: -> { context.success? }

  organize do
    add Billing::CheckQuota
    add Transcriptions::ConvertVideoToAudio, if: -> { needs_video_conversion? }
    add Transcriptions::CreateTranscription, before: :set_create_params
  end

  private

  def set_audio_context
    tf = context.audio.tempfile
    tf.rewind if tf.respond_to?(:rewind)
    context.io = tf
    context.filename = context.audio.original_filename
  end

  def set_create_params
    base_params = if context.url.present?
                    { title: context.url, status: :uploading }
                  else
                    {
                      audio: context.audio,
                      title: File.basename(context.audio.original_filename, '.*'),
                      duration: AudioProcessing::DurationCalculator.calculate(
                        context.audio.tempfile.respond_to?(:path) ? context.audio.tempfile.path : Tempfile.new.path
                      ),
                      status: :in_progress
                    }
                  end
    
    # Add user and account associations if they exist
    base_params[:user] = context.user if context.user.present?
    base_params[:account] = context.account if context.account.present?
    
    context.create_params = base_params
  end

  def transcribe_audio
    TranscribeAudioWorker.perform_later(context.audio_transcription.id, context.url, context.language)
  end

  def needs_video_conversion?
    context.filename.present? && VIDEO_EXTENSIONS.include?(File.extname(context.filename).delete('.').downcase)
  end
end
