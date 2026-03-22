# frozen_string_literal: true

class Transcriptions::Summarizer
  PROMPT = <<~PROMPT.freeze
    You are an expert meeting notes assistant.
    Given a transcript, return a JSON object with:
    - "overview": 2-3 sentence summary of the main topic
    - "key_points": array of 3-5 concise bullet strings
    - "action_items": array of task/follow-up strings, empty array if none

    Respond ONLY with valid JSON. No markdown, no code fences.
  PROMPT

  MAX_INPUT_CHARS = 12_000

  def self.call(transcription_text)
    new(transcription_text).call
  end

  def initialize(transcription_text)
    @transcription_text = transcription_text
  end

  def call
    client = OpenAI::Client.new(access_token: ENV.fetch('OPENAI_ACCESS_TOKEN'))
    response = client.chat(
      parameters: {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: PROMPT },
          { role: 'user', content: @transcription_text.to_s.truncate(MAX_INPUT_CHARS) }
        ],
        response_format: { type: 'json_object' }
      }
    )
    raw = response.dig('choices', 0, 'message', 'content')
    JSON.parse(raw)
  end
end
