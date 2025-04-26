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
    end

    # proceed to actual transcription
    result = Transcriptions::Transcribe.perform(transcription:, language:)

    return if result.success?
    transcription.failed!
  end
end
