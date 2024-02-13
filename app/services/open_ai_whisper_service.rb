# frozen_string_literal: true
class OpenAiError < StandardError; end

class OpenAiWhisperService < ApplicationService
  CHUNK_SIZE = 24 * 1024 * 1024 # 24MB
  SEGMENT_LENGTH = 300 # seconds
  SUPPORTED_FORMATS = %w[flac m4a mp3 mp4 mpeg mpga oga ogg wav webm].freeze
  MAX_RETRIES = 3
  WAIT_DURATION = 5 # seconds
  DEFAULT_RESPONSE_FORMAT = 'text'

  def initialize(blob, response_format = DEFAULT_RESPONSE_FORMAT)
    @blob = blob
    @response_format = response_format
  end

  def call
    # @blob.open do |file|
    #   format = File.extname(file.path).sub('.', '')
    #   file_size = file.size
    #
    #   # response = process_file(file, format, file_size)
    #   # debugger
    #   # read_response(response)
    #   response = check_and_process_file(file_path, format)
    #   read_response(response)
    # end
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
    return [audio_to_text(file_path, format, @response_format)] if File.size(file_path) <= CHUNK_SIZE

    split_and_process(file_path, format)
  end

  def split_and_process(file_path, format)
    segments = split_audio(file_path, format)
    segments.map { |segment| audio_to_text(segment, format, @response_format) }
  end

  def split_audio(file_path, format)
    output_dir = Rails.root.join('tmp', 'audio_segments')
    FileUtils.mkdir_p(output_dir) unless Dir.exist?(output_dir)

    segment_length = SEGMENT_LENGTH # Adjust based on your needs
    output_pattern = File.join(output_dir, "segment_%03d.#{format}")
    command = "ffmpeg -i '#{file_path}' -f segment -segment_time #{segment_length} -c copy '#{output_pattern}'"

    stdout, stderr, status = Open3.capture3(command)

    unless status.success?
      raise "Failed to split audio file: #{stderr}"
    end

    Dir.glob(File.join(output_dir, "segment_*.#{format}"))
  end

  def process_file(file, format, file_size)
    return [audio_to_text(file, format,  @response_format)] if file_size <= CHUNK_SIZE

    process_chunks(file, file_size, format)
  end

  def process_chunks(file, file_size, format)
    # redis to store chunks
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
  #   retries = 0
  #   temp_file = convert_to_format(file, format)
  #
  #   debugger
  #
  #   response = client.audio.transcribe(
  #     parameters: {
  #       language: 'uk',
  #       model: 'whisper-1',
  #       file: File.open(temp_file),
  #       response_format:,
  #     }
  #   )
  #
  #   raise OpenAiError.new(response['error']['message']) if response['error'].present?
  #
  # rescue OpenAiError => e
  #   if (retries += 1) <= MAX_RETRIES
  #     sleep WAIT_DURATION
  #     retry
  #   else
  #     return "Error after #{retries} retries: #{e.message}"
  #   end

  retries = 0
  temp_file = nil
  begin
    transcribe_audio(file, response_format)
  rescue OpenAiError => e
    if (retries += 1) <= MAX_RETRIES
      sleep WAIT_DURATION
      retry
    else
      return "Error after #{retries} retries: #{e.message}"
    end
  ensure
    File.delete(temp_file) if temp_file && File.exist?(temp_file)
  end
  end

  def transcribe_audio(temp_file, response_format)
    response = client.audio.transcribe(
      parameters: {
        language: 'uk',
        model: 'whisper-1',
        file: File.open(temp_file),
        response_format: response_format,
      }
    )

    raise OpenAiError.new(response['error']['message']) if response['error'].present?

    response
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
    return response if @response_format == 'text'

    case @response_format
    when 'text'
      response
    when 'verbose_json'
      read_verbose_json_response(response)
    else
      raise OpenAiError.new("Unsupported response format: #{@response_format}")
    end
  end

  def read_verbose_json_response(response)
    return response.first if response.length <= 1

    first_response = response.first
    offset_time = first_response.is_a?(Array) ? response.first.last['duration'] : response.first['duration']

    response[1..].each do |transcription|
      transcription['segments'].each do |segment|
        segment['start'] = (segment['start'] + offset_time).round(2)
        segment['end'] = (segment['end'] + offset_time).round(2)
        offset_time = segment['end']
      end
    end

    response
  end
end

# sleep 3
# p "transcribed", "--"*100
# "result: Цей фрагмент ефіру вартий того, щоб його послухати.     #{DateTime.now}   \n"
