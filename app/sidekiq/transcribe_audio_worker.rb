require_relative '../services/open_ai_whisper_service'

class TranscribeAudioWorker < ApplicationJob
  queue_as :transcriptions
  retry_on StandardError, wait: :exponentially_longer, attempts: 3
  discard_on OpenAiError

  def perform(transcription_id, url = nil, language = 'en')
    # Find transcription
    transcription = Transcription.find_by(id: transcription_id)
    return unless transcription.present? # Early return if transcription was deleted
    
    # Check if transcription was cancelled
    return if transcription.cancelled?

    begin
      # Process URL if provided
      if url.present?
        process_url(transcription, url)
      end

      # Guard: ensure audio is attached before proceeding
      unless transcription.audio.attached?
        error_msg = "No audio attached for Transcription ##{transcription.id}, aborting transcription"
        Rails.logger.error(error_msg)
        transcription.record_error(error_msg)
        return
      end

      # Proceed to actual transcription
      result = Transcriptions::Transcribe.perform(transcription: transcription, language: language)

      # Handle transcription failure
      unless result.success?
        error_msg = result.error || "Unknown error occurred during transcription"
        transcription.record_error(error_msg)
      end
    rescue StandardError => e
      # Catch any unexpected errors
      error_msg = "Exception during transcription: #{e.message}"
      Rails.logger.error(error_msg)
      Rails.logger.error(e.backtrace.join("\n"))
      transcription.record_error(error_msg)
      raise # Re-raise to trigger retry mechanism
    end
  end

  private

  # Process URL to download media
  def process_url(transcription, url)
    # Update transcription status
    transcription.update_progress(5, :uploading)
    
    # Fetch media from URL
    fetch_ctx = Transcriptions::FetchMedia.perform(url: url)
    unless fetch_ctx.success?
      transcription.record_error(fetch_ctx.error || "Failed to fetch media from URL")
      return false
    end
    
    # Update progress during attachment
    transcription.update_progress(30, :processing)
    
    # Attach media
    transcription.audio.attach(io: fetch_ctx.io, filename: fetch_ctx.filename)
    
    # Update to in_progress status
    transcription.update_progress(50, :in_progress)
    
    # Calculate and update duration after attachment
    if transcription.audio.attached?
      audio_path = transcription.audio.blob.service.send(:path_for, transcription.audio.key)
      duration = AudioProcessing::DurationCalculator.calculate(audio_path)
      transcription.update(duration: duration, title: fetch_ctx.filename)
    end
    
    true
  end
end
