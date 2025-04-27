# frozen_string_literal: true

class Transcriptions::CreateTranscriptionContext < ActiveInteractor::Context::Base
  attributes :create_params
  validates :create_params, presence: true, on: :calling
end

class Transcriptions::CreateTranscription < ActiveInteractor::Base
  def perform
    context.audio_transcription = Transcription.create!(context.create_params)
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(e.message)
  end
end
