# frozen_string_literal: true

class SummarizeTranscriptionWorker
  include Sidekiq::Worker

  sidekiq_options queue: :transcriptions, retry: 2

  def perform(transcription_id)
    transcription = Transcription.find_by(id: transcription_id)
    return unless transcription
    return if transcription.transcription.blank?

    summary = Transcriptions::Summarizer.call(transcription.transcription)
    transcription.update!(summary: summary)

    ActionCable.server.broadcast(
      "transcription_channel_#{transcription_id}",
      { summary: summary, id: transcription_id }
    )
  rescue StandardError => e
    Rails.logger.error("SummarizeTranscriptionWorker failed for #{transcription_id}: #{e.message}")
    raise
  end
end
