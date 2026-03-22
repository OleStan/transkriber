# frozen_string_literal: true

class Transcriptions::Update < ActiveInteractor::Base
  def perform
    transcription = Transcription.find_by(id: context.id)
    context.fail! unless transcription && transcription.owned_by?(context.user)

    return unless context.success?

    unless transcription.update(
      transcription: context.transcription_text,
      transcription_json: context.transcription_json
    )
      context.fail!
    end

    context.transcription = transcription
  end
end
