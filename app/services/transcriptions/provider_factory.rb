# frozen_string_literal: true

class Transcriptions::ProviderFactory
  PROVIDERS = %w[openai google].freeze

  def self.for(provider_name = nil)
    name = (provider_name || ENV.fetch('TRANSCRIPTION_PROVIDER', 'openai')).to_s.downcase

    case name
    when 'openai' then OpenAiAdapter
    when 'google' then GoogleAdapter
    else
      raise ArgumentError, "Unknown transcription provider: #{name}. Valid providers: #{PROVIDERS.join(', ')}"
    end
  end

  # ── OpenAI adapter ──────────────────────────────────────────────────────────
  module OpenAiAdapter
    def self.call(blob, response_format, language: nil, progress_callback: nil)
      # OpenAiWhisperService#initialize takes positional args: (blob, response_format, language, progress_callback)
      OpenAiWhisperService.call(blob, response_format, language, progress_callback)
    end
  end

  # ── Google adapter ───────────────────────────────────────────────────────────
  module GoogleAdapter
    def self.call(blob, response_format, language: nil, progress_callback: nil)
      # Google doesn't support real-time progress; report start and end only
      progress_callback&.call(0)

      google_language = map_language(language)
      result = GoogleSpeechToTextService.new(blob, response_format, google_language).call

      progress_callback&.call(100)

      # Normalize to OpenAI-compatible format when verbose_json is requested
      if response_format == 'verbose_json'
        Transcriptions::GoogleResponseNormalizer.call(result)
      else
        result
      end
    end

    def self.map_language(language)
      # OpenAI uses ISO 639-1 codes (e.g. "en"), Google needs BCP-47 (e.g. "en-US")
      return 'en-US' if language.nil? || language == 'auto'

      LANGUAGE_MAP.fetch(language.to_s.downcase, "#{language}-#{language.upcase}")
    end

    LANGUAGE_MAP = {
      'en' => 'en-US',
      'es' => 'es-ES',
      'fr' => 'fr-FR',
      'de' => 'de-DE',
      'it' => 'it-IT',
      'pt' => 'pt-BR',
      'nl' => 'nl-NL',
      'pl' => 'pl-PL',
      'uk' => 'uk-UA',
      'ru' => 'ru-RU',
      'ja' => 'ja-JP',
      'zh' => 'zh-CN',
      'ko' => 'ko-KR',
      'ar' => 'ar-SA',
      'tr' => 'tr-TR',
    }.freeze
  end
end
