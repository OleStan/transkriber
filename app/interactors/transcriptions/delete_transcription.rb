# frozen_string_literal: true

class Transcriptions::DeleteTranscriptionContext < ActiveInteractor::Context::Base
  attributes :id
  validates :id, presence: true
end

class Transcriptions::DeleteTranscription < ActiveInteractor::Base
  def perform
    context.transcription = Transcription.find(id)
    delete_transcription
  end

  private

  delegate :id, :transcription, to: :context

  def delete_transcription
    transcription.destroy
  end
end
