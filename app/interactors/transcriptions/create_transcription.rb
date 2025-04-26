# frozen_string_literal: true

class Transcriptions::CreateTranscription < ActiveInteractor::Base
  def perform
    context.audio_transcription = Transcription.create!(**context.create_params)
  rescue StandardError => e
    context.fail!(e.message)
  end
end
