# frozen_string_literal: true

class Transcriptions::DeleteTranscriptionContext < ActiveInteractor::Context::Base
  attributes :id, :user, :account
  validates :id, presence: true
end

class Transcriptions::DeleteTranscription < ActiveInteractor::Base
  def perform
    context.transcription = Transcription.find(id)
    verify_ownership
    delete_transcription if context.success?
  end

  private

  delegate :id, :transcription, :user, :account, to: :context

  def verify_ownership
    return unless user.present?
    
    # Use the owned_by? helper method from the Transcription model
    context.fail!(message: 'Not authorized to delete this transcription') unless transcription.owned_by?(user)
  end

  def delete_transcription
    transcription.destroy
  end
end
