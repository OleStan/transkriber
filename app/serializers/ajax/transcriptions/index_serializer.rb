# frozen_string_literal: true

class Ajax::Transcriptions::IndexSerializer < ActiveModel::Serializer
  attributes :id, :audio_filename, :created_at_formatted, :status,
             :duration

  def audio_filename
    return object.title if object.title.present?
    return object.audio.blob.filename.to_s if object.audio.attached?

    'No title'
  end

  def created_at_formatted
    object.created_at.strftime("%d.%m.%Y")
  end

  def duration
    duration_to_hms
  end

  private

  def duration_to_hms
    return if object.duration.nil?

    total_seconds = object.duration.to_i
    hours = total_seconds / 3600
    minutes = (total_seconds % 3600) / 60
    seconds = total_seconds % 60
    "#{hours}h #{minutes}m #{seconds}s"
  end
end
