# frozen_string_literal: true

class Transcriptions::CreateContext < ActiveInteractor::Context::Base
  attributes :audio, :url, :language
  attributes :audio_transcription

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

# TODO: Make it Transaction Defered interactor
class Transcriptions::Create < ActiveInteractor::Base
  after_perform :transcribe_audio, if: -> { context.success? }

  def perform
    io, filename = fetch_media
    io, filename = convert_video_to_audio(io, filename)

    attachment = { io: io, filename: filename }

    context.audio_transcription = Transcription.create!(
      audio: attachment,
      title: File.basename(filename, '.*'),
      duration: AudioProcessing::DurationCalculator.calculate(tempfile_path(io))
    )

    context.data = { transcription_id: context.audio_transcription.id }
  rescue StandardError => e
    context.fail!(e.message)
  end

  private

  delegate :audio, :url, :language, to: :context

  def fetch_media
    if url.present?
      downloaded = MediaDownloadService.new(url).download
      [downloaded[:io], downloaded[:filename]]
    else
      [audio.tempfile, audio.original_filename]
    end
  end

  def build_data
    context.data = {
      transcription_id: audio_transcription.id
    }
  end

  def convert_video_to_audio(io, filename)
    ext = File.extname(filename).delete('.').downcase
    if %w[mp4 webm mov mpeg].include?(ext)
      audio_blob = VideoToAudioService.call(io)
      # Припускаємо, що VideoToAudioService повертає Hash { io:…, filename:… }
      [audio_blob[:io], audio_blob[:filename]]
    else
      [io, filename]
    end
  end

  def audio_file_name
    File.basename(context.audio.original_filename, '.*') if context.audio.respond_to?(:original_filename)
  end

  def tempfile_path(io)
    io.respond_to?(:path) ? io.path : Tempfile.new.path
  end

  def transcribe_audio
    # TranscribeAudioWorker.perform_async(audio_transcription.id, language) # TODO: Setup Sidekiq
    TranscribeAudioWorker.perform_later(context.audio_transcription.id, language)
  end
end
