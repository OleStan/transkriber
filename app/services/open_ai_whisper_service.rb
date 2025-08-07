# frozen_string_literal: true

class OpenAiError < StandardError; end

class OpenAiWhisperService < ApplicationService
  CHUNK_SIZE = 24 * 1024 * 1024 # 24MB
  SEGMENT_LENGTH = 300 # seconds
  SUPPORTED_FORMATS = %w[flac m4a mp3 mp4 mpeg mpga oga ogg wav webm].freeze
  MAX_RETRIES = 3
  WAIT_DURATION = 5 # seconds
  DEFAULT_RESPONSE_FORMAT = 'text'

  def initialize(blob, response_format = DEFAULT_RESPONSE_FORMAT, language = 'en', progress_callback = nil)
    super()
    @blob = blob
    @response_format = response_format
    @language = language
    @progress_callback = progress_callback
  end

  def call
    raise OpenAiError, 'No audio blob provided to transcribe' unless @blob

    # Report initial progress
    report_progress(0) if @progress_callback

    result = nil
    begin
      @blob.open(tmpdir: Rails.root.join('tmp')) do |file|
        format = @blob.filename.extension_without_delimiter
        response = check_and_process_file(file.path, format)
        result = read_response(response)
      end

      # Report completion
      report_progress(100) if @progress_callback
      result
    rescue StandardError => e
      # Log error details
      Rails.logger.error("[OpenAiWhisperService] Transcription failed: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      
      # Raise exception with detailed message
      raise OpenAiError, "Failed to transcribe audio: #{e.message}"
    end
  end

  private

  def check_and_process_file(file_path, format)
    if File.size(file_path) <= CHUNK_SIZE
      # Single file processing
      report_progress(10) if @progress_callback
      return [audio_to_text(file_path, format, @response_format)]
    end

    # Multi-chunk processing
    split_and_process(file_path, format)
  end

  def split_and_process(file_path, format)
    # Report progress for splitting start
    report_progress(5) if @progress_callback
    
    segments = split_audio(file_path, format)
    total_segments = segments.size
    
    # Process each segment with progress reporting
    segments.map.with_index do |segment, index|
      # Calculate and report progress (5-95% range)
      progress = 5 + ((index.to_f / total_segments) * 90).to_i
      report_progress(progress) if @progress_callback
      
      result = audio_to_text(segment, format, @response_format)
      
      # Clean up temp segment file after processing
      FileUtils.rm_f(segment)
      
      result
    end
  end

  def split_audio(file_path, format)
    output_dir = Rails.root.join('tmp', 'audio_segments')
    FileUtils.mkdir_p(output_dir)

    segment_length = SEGMENT_LENGTH # Adjust based on your needs
    output_pattern = File.join(output_dir, "segment_%03d.#{format}")
    command = "ffmpeg -i '#{file_path}' -f segment -segment_time #{segment_length} -c copy '#{output_pattern}'"

    _, stderr, status = Open3.capture3(command)

    raise "Failed to split audio file: #{stderr}" unless status.success?

    Dir.glob(File.join(output_dir, "segment_*.#{format}"))
  end

  def process_file(file, format, file_size)
    return [audio_to_text(file, format, @response_format)] if file_size <= CHUNK_SIZE

    process_chunks(file, file_size, format)
  end

  def process_chunks(file, file_size, format)
    # redis to store chunks
    chunks = (file_size.to_f / CHUNK_SIZE).ceil
    (0...chunks).map do |i|
      chunk = extract_chunk(file, i, CHUNK_SIZE, file_size)
      audio_to_text(chunk, format, @response_format)
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

  def audio_to_text(file, _format, response_format)
    retries = 0
    temp_file = nil
    begin
      transcribe_audio(file, response_format)
    rescue OpenAiError => e
      return "Error after #{retries} retries: #{e.message}" unless (retries += 1) <= MAX_RETRIES
      sleep WAIT_DURATION
      retry
    ensure
      File.delete(temp_file) if temp_file && File.exist?(temp_file)
    end
  end

  def transcribe_audio(temp_file, response_format)
    return mocked_response if Rails.env.development?

    response = client.audio.transcribe(
      parameters: {
        language: @language,
        model: 'whisper-1',
        file: File.open(temp_file),
        response_format:
      }
    )

    raise OpenAiError, response['error']['message'] if response['error'].present?

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
      raise OpenAiError, "Unsupported response format: #{@response_format}"
    end
  end

  def read_verbose_json_response(response)
    return response.first if response.length <= 1

    offset_time = 0
    response[1..].each do |transcription|
      transcription['segments'].each do |segment|
        segment['start'] = (segment['start'] + offset_time).round(2)
        segment['end'] = (segment['end'] + offset_time).round(2)
      end
      offset_time = transcription['segments'][-1]['end']
    end

    response
  end

  def mocked_response
    # Simulate real-world processing with progress updates
    total_steps = 10
    total_steps.times do |step|
      progress = ((step.to_f / total_steps) * 100).to_i
      report_progress(progress) if @progress_callback
      sleep 0.5 # shorter sleep for better UX in development
    end
    
    # Return mocked data
    MockedData.mocked_openai_whisper_response(100)
  end
  
  # Report progress through callback
  def report_progress(percentage)
    return unless @progress_callback
    
    # Ensure percentage is within bounds
    percentage = [[percentage.to_i, 0].max, 100].min
    @progress_callback.call(percentage)
  end
end
