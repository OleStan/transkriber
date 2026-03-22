# frozen_string_literal: true

class Ajax::Transcriptions::ShowSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers
  include AudioTranscriptionHelper

  attributes :id, :audio_filename, :status, :created_at_formatted, :audio_transcription_path, :transcriptions, :duration, :summary

  def audio_filename
    return object.title if object.title.present?
    return object.audio.blob.filename.to_s if object.audio.attached?

    'No title'
  end

  def created_at_formatted
    object.created_at.strftime('%d.%m.%Y %H:%M')
  end

  def audio_transcription_path
    return unless object.audio.attached?

    host = ENV.fetch('HOST', 'http://localhost:3000')
    "#{host}#{rails_blob_url(object.audio, only_path: true)}"
  end

  def transcriptions
    return if object.transcription_json.nil?

    parse_transcription
  end

  def summary
    object.summary
  end

  private

  def parse_transcription
    return map_segments(object.transcription_json) if object.transcription_json.is_a?(Hash)

    object.transcription_json.map do |transcription|
      map_segments(transcription)
    end.flatten
  end

  def map_segments(transcription)
    transcription['segments'].map do |segment|
      {
        id: segment['id'],
        timestamp: segment_timestamp(segment),
        text: segment['text'],
        start: segment['start'],
        end: segment['end']
      }
    end
  end
end
