# frozen_string_literal: true

class Ajax::Transcriptions::IndexSerializer < ActiveModel::Serializer
  attributes :id, :audio_filename, :created_at_formatted, :audio_transcription_path

  def audio_filename
    object.audio.blob.filename.to_s if object.audio.attached?
  end

  def created_at_formatted
    object.created_at.strftime("%d.%m.%Y %H:%M")
  end

  def audio_transcription_path
    Rails.application.routes.url_helpers.audio_transcription_path(object)
  end
end
