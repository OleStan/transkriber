class AudioTranscription < ApplicationRecord
  has_one_attached :audio
  default_scope { order(created_at: :desc) }

  self.per_page = 10

  def audio_on_disk
    ActiveStorage::Blob.service.path_for(audio.key)
  end

  def transcribe_audio
    OpenAiWhisperService.call(audio.blob)
  end

  private

  def raw_command_to_system
    language = "Ukrainian"
    filename = ""
    model = "medium"
    command = "whisper #{filename} --model #{model} --language #{language}"
  end
end
