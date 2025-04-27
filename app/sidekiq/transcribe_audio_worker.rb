class TranscribeAudioWorker < ApplicationJob
  # include Sidekiq::Job
  # sidekiq_options queue: :transcriptions, retry: 3

  def perform(transcription_id, url = nil, language = 'en')
    transcription = Transcription.find(transcription_id)

    # download when url provided
    if url.present?
      fetch_ctx = Transcriptions::FetchMedia.perform(url: url)
      unless fetch_ctx.success?
        transcription.failed!
        return
      end
      transcription.audio.attach(io: fetch_ctx.io, filename: fetch_ctx.filename)
      transcription.in_progress!
      # Calculate and update duration after attachment
      if transcription.audio.attached?
        audio_path = transcription.audio.blob.service.send(:path_for, transcription.audio.key)
        duration = AudioProcessing::DurationCalculator.calculate(audio_path)
        transcription.update(duration: duration, title: fetch_ctx.filename)
      end
    end

    # guard: ensure audio is attached before calling transcription service
    unless transcription.audio.attached?
      Rails.logger.error("No audio attached for Transcription ##{transcription.id}, aborting transcription")
      transcription.failed!
      return
    end

    # proceed to actual transcription
    result = Transcriptions::Transcribe.perform(transcription: transcription, language: language)

    return if result.success?
    transcription.failed!
  end
end
