# frozen_string_literal: true

class TranscribeAudioTranscriptionContext < ActiveInteractor::Context::Base
  attr_accessor :id
  validates :id, presence: true
end

class TranscribeAudioTranscription < ActiveInteractor::Base
  def perform
    context.audio_transcription = AudioTranscription.find(context.id)

    context.json_transcription = transcribe_audio

    context.audio_transcription.update(transcription: text_from_audio, transcription_json: context.json_transcription)
  end

  private

  delegate :audio_transcription, :json_transcription, to: :context

  def transcribe_audio
    OpenAiWhisperService.call(audio_transcription.audio.blob, 'verbose_json')
  end

  def text_from_audio
    return json_transcription['text'] if json_transcription.is_a?(Hash)

    json_transcription.map { |transcription| transcription['text'] }.join
  end
end
