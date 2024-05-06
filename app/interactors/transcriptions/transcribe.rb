# frozen_string_literal: true

class Transcriptions::TranscribeContext < ActiveInteractor::Context::Base
  attributes :transcription, :language

  validates :transcription, presence: true
end

class Transcriptions::Transcribe < ActiveInteractor::Base
  include AudioTranscriptionHelper

  after_rollback :set_failed_status

  def perform
    transcription.update(status: 'in_progress') # TODO: some kind of transaction

    transcribe_audio
    transcription.update(transcription: text_from_audio, transcription_json:, status: 'completed')
    broadcast_transcription
  end

  private

  delegate :transcription, :transcription_json, :language, to: :context

  def transcribe_audio
    context.transcription_json = OpenAiWhisperService.call(transcription.audio.blob, 'verbose_json', language:)
  rescue StandardError => e
    Rails.logger.error("Error transcribing audio: #{e.message}")
    context.fail!(error: e.message)
  end

  def broadcast_transcription
    ActionCable.server.broadcast(
      "transcription_channel_#{transcription.id}",
      { status: 'completed', transcription: transcription.transcription, transcription_json: parse_transcription}
    )
  end

  def text_from_audio
    return transcription_json['text'] if transcription_json.is_a?(Hash)

    transcription_json.map { |transcription| transcription['text'] }.join
  end

  def set_failed_status
    transcription.update_column(:status, 'failed')
  end

  ## This code same as in Transcription show serializer move it to shared modules
  def parse_transcription
    return map_segments(transcription_json) if transcription_json.is_a?(Hash)

    transcription_json.map do |transcription|
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
