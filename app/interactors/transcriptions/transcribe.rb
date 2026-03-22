# frozen_string_literal: true

class Transcriptions::TranscribeContext < ActiveInteractor::Context::Base
  attributes :transcription, :language

  validates :transcription, presence: true
end

class Transcriptions::Transcribe < ActiveInteractor::Base
  include AudioTranscriptionHelper

  after_perform :ensure_progress_completion, if: -> { context.success? }
  after_rollback :handle_failure

  def perform
    # Initialize progress at the beginning
    transcription.update_progress(0, 'transcribing')

    # Try the transcription with error handling and progress reporting
    begin
      transcribe_audio
      
      # Post-processing after successful transcription
      transcription.update_progress(80, 'post_processing')
      transcription.update(transcription: text_from_audio, transcription_json:)
      
      # Final update and broadcast
      transcription.update_progress(100, 'completed')
      broadcast_transcription
    rescue StandardError => e
      context.fail!(error: e.message)
    end
  end

  private

  delegate :transcription, :transcription_json, :language, to: :context

  def transcribe_audio
    # Set up progress tracking callback
    progress_callback = ->(progress) {
      # Update every 10% to avoid too many updates
      if progress % 10 == 0
        # Scale progress to 10-70% range during transcription
        scaled_progress = 10 + (progress * 0.6).to_i
        transcription.update_progress(scaled_progress)
      end
    }
    
    # Call the configured provider with progress tracking
    provider = Transcriptions::ProviderFactory.for
    context.transcription_json = provider.call(
      transcription.audio.blob,
      'verbose_json',
      language: language,
      progress_callback: progress_callback
    )
  end

  def broadcast_transcription
    ActionCable.server.broadcast(
      "transcription_channel_#{transcription.id}",
      { status: 'completed', transcription: transcription.transcription, transcription_json: parse_transcription}
    )
  end

  def text_from_audio
    return transcription_json['text'] if transcription_json.is_a?(Hash)

    transcription_json.map { |transcription| transcription['text'] }.join
  end

  def handle_failure
    error_message = context.error || 'Transcription failed with unknown error'
    transcription.record_error(error_message)
    Rails.logger.error("Error transcribing audio: #{error_message}")
  end
  
  # Ensure we always set to 100% if successful
  def ensure_progress_completion
    transcription.update_progress(100, 'completed') unless transcription.progress == 100
  end

  ## This code same as in Transcription show serializer move it to shared modules
  def parse_transcription
    return map_segments(transcription_json) if transcription_json.is_a?(Hash)

    transcription_json.map do |transcription|
      map_segments(transcription)
    end.flatten
  end

  def map_segments(transcription)
    transcription['segments'].map do |segment|
      {
        id: segment['id'],
        timestamp: segment_timestamp(segment),
        text: segment['text'],
        start: segment['start'],
        end: segment['end']
      }
    end
  end
end
