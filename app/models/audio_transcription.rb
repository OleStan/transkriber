class AudioTranscription < ApplicationRecord
  require 'open3'
  require 'streamio-ffmpeg'

  has_one_attached :audio
  default_scope { order(created_at: :desc) }

  self.per_page = 10

  def audio_on_disk
    ActiveStorage::Blob.service.path_for(audio.key)
  end

  def transcribe_audio
    OpenAiWhisperService.call(audio.blob)
  end

  def chankinizator
    audio.blob.open do |file|
      file_size = file.size

      chunk_size = 24 * 1024 * 1024 # 24MB
      chunks = (file_size.to_f / chunk_size).ceil

      (0...chunks).each do |i|
        offset = i * chunk_size
        length = [chunk_size, file_size - offset].min

        chunk_file = Tempfile.new
        chunk_file.binmode
        chunk_file.write(file.read(length))
        chunk_file.close

        p chunk_file, chunk_file.open

        # process the chunk file as needed
      end
    end

  end

  private

  def raw_command_to_system
    language = "Ukrainian"
    filename = ""
    model = "medium"
    command = "whisper #{filename} --model #{model} --language #{language}"
  end
end
