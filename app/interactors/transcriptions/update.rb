# frozen_string_literal: true

class Transcriptions::Update < ActiveInteractor::Base
  def perform
    transcription = Transcription.find_by(id: context.id)

    unless transcription
      context.fail!(errors: OpenStruct.new(full_messages: ['Transcription not found']))
      return
    end

    unless transcription.owned_by?(context.user)
      context.fail!(errors: OpenStruct.new(full_messages: ['Not authorized']))
      return
    end

    unless transcription.update(
      transcription: context.transcription_text,
      transcription_json: context.transcription_json
    )
      context.fail!(errors: transcription.errors)
    end

    context.transcription = transcription
  end
end
