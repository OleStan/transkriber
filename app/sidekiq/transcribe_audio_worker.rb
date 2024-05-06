class TranscribeAudioWorker < ApplicationJob
  # include Sidekiq::Job
  # sidekiq_options queue: :transcriptions, retry: 3

  def perform(transcription_id, language = 'en')
    transcription = Transcription.find(transcription_id)

    Transcriptions::Transcribe.perform(transcription:, language:)
  end
end
