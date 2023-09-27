# frozen_string_literal: true

class OpenAiWhisperService < ApplicationService
  require "openai"
  require 'httparty'
  require 'streamio-ffmpeg'

  def initialize(blob)
    @blob = blob
  end

  def call
    transcript_audio
  end

  private

  def transcript_audio
    time_start = Time.now
    response = []
    @blob.open do |file|
      file_size = file.size
      format = File.extname(file.path).sub('.', '')

      chunk_size = 24 * 1024 * 1024 # 24MB
      if file_size > chunk_size
        chunks = (file_size.to_f / chunk_size).ceil

        (0...chunks).each do |i|
          offset = i * chunk_size
          length = [chunk_size, file_size - offset].min

          chunk_file = Tempfile.new(['audio', "-#{i}.chunk"], unlink: true)
          chunk_file.binmode
          chunk_file.write(file.read(length))
          chunk_file.close
          response << audio_to_text(chunk_file.open, format)
          p response
        end
      else
        response << audio_to_text(File.open(file.path), format)
      end
    end

    p "finish at #{Time.now - time_start}"

    response
  end


  def audio_to_text(file, format)
    url = 'https://api.openai.com/v1/audio/transcriptions'
    model = 'whisper-1'
    auth_token = ENV.fetch('OPENAI_ACCESS_TOKEN')

    # Convert chunk file to original format
    temp_file = Tempfile.new(['audio', ".#{format}"])
    system("yes | ffmpeg -i #{file.path} -acodec copy #{temp_file.path}")

    # Send converted file to OpenAI API
    response = HTTParty.post(url, {
      headers: {
        'Authorization' => "Bearer #{auth_token}",
        'Content-Type' => 'multipart/form-data'
      },
      body: {
        file: File.open(temp_file),
        model: model,
        language: 'ua',
      },
    timeout: 180, # increase the timeout to 60 seconds
      open_timeout: 180 # increase the open timeout to 30 seconds
    })

    return "Error: #{response["error"]}" if response["error"].present?

    response["text"]

  end

end

# sleep 3
# p "transcribed", "--"*100
# "result: Цей фрагмент ефіру вартий того, щоб його послухати.     #{DateTime.now}   \n"
