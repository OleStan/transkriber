# frozen_string_literal: true

class OpenAiWhisperService < ApplicationService
  require "openai"
  require 'httparty'

  def initialize(blob)
    @blob = blob
  end

  def call
    transcript_audio
  end

  private

  def transcript_audio
    time_start = Time.now

    response = @blob.open { |file| audio_to_text(file.path) }

    p "finish at #{Time.now - time_start}"

    p "--" * 100, "result: #{response}", "--" * 100

    response
  end

  def audio_to_text(file_path)
    url = 'https://api.openai.com/v1/audio/transcriptions'
    model = 'whisper-1'
    auth_token = ENV.fetch('OPENAI_ACCESS_TOKEN')

    response = HTTParty.post(url, {
      headers: {
        'Authorization' => "Bearer #{auth_token}",
        'Content-Type' => 'multipart/form-data'
      },
      body: {
        file: File.open(file_path),
        model: model
      }
    })
    return "Error: #{response["error"]}" if response["error"].present?
    response["text"]

  end

end
