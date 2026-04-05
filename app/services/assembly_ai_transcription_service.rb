# frozen_string_literal: true

class AssemblyAiTranscriptionService < ApplicationService
  LANGUAGE_MAP = {
    'en' => 'en',
    'es' => 'es',
    'fr' => 'fr',
    'de' => 'de',
    'it' => 'it',
    'pt' => 'pt',
    'nl' => 'nl',
    'hi' => 'hi',
    'ja' => 'ja',
    'zh' => 'zh',
    'ko' => 'ko',
    'pl' => 'pl',
    'ru' => 'ru',
    'tr' => 'tr',
    'uk' => 'uk',
    'sv' => 'sv',
    'ar' => 'ar',
  }.freeze

  def initialize(blob, response_format, language: nil, progress_callback: nil)
    @blob = blob
    @response_format = response_format
    @language = language
    @progress_callback = progress_callback
  end

  def call
    client = AssemblyAI::Client.new(api_key: ENV.fetch('ASSEMBLYAI_API_KEY'))

    report_progress(5)

    upload_url = upload_audio(client)
    report_progress(10)

    params = { audio_url: upload_url, speaker_labels: @response_format == 'verbose_json' }
    lang = LANGUAGE_MAP[@language.to_s.downcase] if @language && @language != 'auto'
    params[:language_code] = lang if lang

    transcript = client.transcripts.transcribe(**params)

    raise AssemblyAiError, transcript.error || 'AssemblyAI transcription failed' if transcript.status == 'error'

    report_progress(90)

    @response_format == 'verbose_json' ? build_verbose_json(transcript) : transcript.text
  rescue AssemblyAI::APIError => e
    raise AssemblyAiError, e.message
  end

  private

  def upload_audio(client)
    ext = File.extname(@blob.filename.to_s)
    Tempfile.create(['assemblyai_audio', ext], binmode: true) do |tmp|
      tmp.write(@blob.download)
      tmp.rewind
      client.files.upload(file: tmp)
    end
  end

  def build_verbose_json(transcript)
    segments = (transcript.utterances || []).each_with_index.map do |utterance, i|
      {
        'id'      => i,
        'text'    => utterance.text,
        'start'   => (utterance.start / 1000.0).round(2),
        'end'     => (utterance.end   / 1000.0).round(2),
        'speaker' => utterance.speaker,
      }
    end
    { 'text' => transcript.text, 'segments' => segments }
  end

  def report_progress(value)
    @progress_callback&.call(value)
  end
end

class AssemblyAiError < StandardError; end
