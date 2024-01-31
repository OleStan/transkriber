# frozen_string_literal: true
class OpenAiError < StandardError; end

class OpenAiWhisperService < ApplicationService
  CHUNK_SIZE = 24 * 1024 * 1024 # 24MB
  SUPPORTED_FORMATS = %w[flac m4a mp3 mp4 mpeg mpga oga ogg wav webm].freeze
  MAX_RETRIES = 3
  WAIT_DURATION = 5 # seconds
  DEFAULT_RESPONSE_FORMAT = 'text'

  def initialize(blob, response_format = DEFAULT_RESPONSE_FORMAT)
    @blob = blob
    @response_format = response_format
  end

  def call
    @blob.open do |file|
      format = File.extname(file.path).sub('.', '')
      file_size = file.size

      return [audio_to_text(file, format,  @response_format)] if file_size <= CHUNK_SIZE

      process_chunks(file, file_size, format)
    end
  end

  private

  def process_chunks(file, file_size, format)
    chunks = (file_size.to_f / CHUNK_SIZE).ceil
    (0...chunks).map do |i|
      chunk = extract_chunk(file, i, CHUNK_SIZE, file_size)
      audio_to_text(chunk, format,  @response_format)
    end
  end

  def extract_chunk(file, index, chunk_size, file_size)
    offset = index * chunk_size
    length = [chunk_size, file_size - offset].min

    chunk_file = Tempfile.new(['audio', "-#{index}.chunk"], unlink: true)
    chunk_file.binmode
    chunk_file.write(file.read(length))
    chunk_file.close
    chunk_file
  end

  def audio_to_text(file, format, response_format)
    retries = 0
    temp_file = convert_to_format(file, format)

    response = client.audio.transcribe(
      parameters: {
        language: 'uk',
        model: 'whisper-1',
        file: File.open(temp_file),
        response_format:,
      }
    )

    raise OpenAiError.new(response['error']['message']) if response['error'].present?

    read_response(response)

  rescue OpenAiError => e
    if (retries += 1) <= MAX_RETRIES
      sleep WAIT_DURATION
      retry
    else
      return "Error after #{retries} retries: #{e.message}"
    end
  end

  def convert_to_format(file, format)
    temp_file = Tempfile.new(['audio', ".#{format}"])
    system("yes | ffmpeg -i #{file.path} -acodec copy #{temp_file.path}")
    temp_file
  end

  def client
    @client ||= OpenAI::Client.new
  end

  def read_response(response)
    return response.to_s if @response_format == 'text'

    read_verbose_json_response(response).to_s
  end

  def read_verbose_json_response(response)
    response = response['segments'].map do |segment|
      {
        id: segment['id'],
        text: segment['text'],
        start: segment['start'],
        end: segment['end']
      }
    end

    return response.flatten! if response.length <= 1

    first_response = response.first
    offset_time = first_response.is_a?(Array) ? response.first.last[:end] : response.first[:end]

    response.drop(1).each do |segment|
      segment.each do |entry|
        entry[:start] = (entry[:start] + offset_time).round(2)
        entry[:end] = (entry[:end] + offset_time).round(2)
        offset_time = entry[:end]
      end
    end

    response.flatten!
  end
end

# sleep 3
# p "transcribed", "--"*100
# "result: Цей фрагмент ефіру вартий того, щоб його послухати.     #{DateTime.now}   \n"
