# frozen_string_literal: true

require "google/cloud/speech"
require "open3"
require "fileutils"

class GoogleSpeechError < StandardError; end

class GoogleSpeechToTextService < ApplicationService
  CHUNK_SIZE = 24 * 1024 * 1024 # 24MB
  SEGMENT_LENGTH = 300 # seconds
  SUPPORTED_FORMATS = %w[flac m4a mp3 mp4 mpeg mpga oga ogg wav webm].freeze
  MAX_RETRIES = 3
  WAIT_DURATION = 5 # seconds
  DEFAULT_RESPONSE_FORMAT = 'text'

  def initialize(blob, response_format = DEFAULT_RESPONSE_FORMAT, language = 'en-US')
    @blob = blob
    @response_format = response_format
    @language = language
  end

  def call
    raise GoogleSpeechError, 'No audio blob provided to transcribe' unless @blob

    result = nil
    @blob.open(tmpdir: Rails.root.join('tmp')) do |file|
      format = @blob.filename.extension_without_delimiter
      response = check_and_process_file(file.path, format)
      result = read_response(response)
    end
    result
  end

  private

  def check_and_process_file(file_path, format)
    raise GoogleSpeechError, "Unsupported format: #{format}" unless SUPPORTED_FORMATS.include?(format)

    if File.size(file_path) <= CHUNK_SIZE
      audio_to_text(file_path)
    else
      split_and_process(file_path, format)
    end
  end

  def split_and_process(file_path, format)
    segments = split_audio(file_path, format)
    segments.map { |segment| audio_to_text(segment) }
  end

  def split_audio(file_path, format)
    output_dir = Rails.root.join('tmp', 'audio_segments')
    FileUtils.mkdir_p(output_dir)

    segment_length = SEGMENT_LENGTH
    output_pattern = File.join(output_dir, "segment_%03d.#{format}")
    command = "ffmpeg -i '#{file_path}' -f segment -segment_time #{segment_length} -c copy '#{output_pattern}'"

    _, stderr, status = Open3.capture3(command)
    raise GoogleSpeechError, "Failed to split audio file: #{stderr}" unless status.success?

    Dir.glob(File.join(output_dir, "segment_*.#{format}"))
  end

  def audio_to_text(file_path)
    retries = 0
    begin
      transcribe_audio(file_path)
    rescue GoogleSpeechError => e
      return "Error after #{retries} retries: #{e.message}" unless (retries += 1) <= MAX_RETRIES
      sleep WAIT_DURATION
      retry
    end
  end

  def transcribe_audio(file_path)
    return mocked_response if Rails.env.development?

    client = speech_client
    config = { encoding: :ENCODING_UNSPECIFIED, language_code: @language }
    audio  = { content: File.binread(file_path) }

    operation = client.long_running_recognize(config: config, audio: audio)
    operation.wait_until_done!

    if operation.error?
      raise GoogleSpeechError, operation.results.message
    end

    operation.operation.response.results
  end

  def speech_client
    @speech_client ||= Google::Cloud::Speech.speech
  end

  def mocked_response
    sleep WAIT_DURATION
    []
  end

  def read_response(response)
    case @response_format
    when 'text'
      response.map(&:alternatives).map(&:first).map(&:transcript).join(' ')
    when 'verbose_json'
      response.map do |result|
        result.alternatives.map do |alt|
          {
            transcript: alt.transcript,
            confidence: alt.confidence,
            words: alt.words.map { |w| { word: w.word, start_time: w.start_time.seconds + w.start_time.nanos / 1e9, end_time: w.end_time.seconds + w.end_time.nanos / 1e9 } }
          }
        end
      end
    else
      raise GoogleSpeechError, "Unsupported response format: #{@response_format}"
    end
  end
end
