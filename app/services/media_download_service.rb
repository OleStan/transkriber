# app/services/media_download_service.rb
require 'open-uri'
require 'tmpdir'
require 'open3'

class MediaDownloadService
  # Patterns to recognize YouTube URLs
  YOUTUBE_HOSTS = [
    %r{\Ahttps?://(www\.)?youtube\.com},
    %r{\Ahttps?://youtu\.be}
  ].freeze

  def initialize(url)
    @url        = url
    @downloader = detect_downloader
  end

  # Public API: returns a hash with :io and :filename for the downloaded media
  def download
    if youtube_url?
      download_from_youtube
    else
      download_generic
    end
  end

  private

  # Find either yt-dlp or youtube-dl in PATH
  def detect_downloader
    %w[yt-dlp youtube-dl].find { |cmd| command_exist?(cmd) } ||
      raise("Neither yt-dlp nor youtube-dl found. Please install via Homebrew (macOS) or pip3 (Ubuntu).")
  end

  def command_exist?(cmd)
    system("which #{cmd} > /dev/null 2>&1")
  end

  def youtube_url?
    YOUTUBE_HOSTS.any? { |regex| @url.match?(regex) }
  end

  # Download audio from YouTube using the detected CLI
  def download_from_youtube
    Dir.mktmpdir('media_dl') do |dir|
      # Template for output filenames
      output_template = File.join(dir, '%(title)s.%(ext)s')
      cmd = [
        @downloader,
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '-o', output_template,
        @url
      ]

      stdout, stderr, status = Open3.capture3(*cmd)
      unless status.success?
        raise "Download failed (#{@downloader}): #{stderr}"
      end

      files = Dir.glob(File.join(dir, '*'))
      raise 'No files were downloaded.' if files.empty?

      latest_file = files.max_by { |f| File.mtime(f) }
      { io: File.open(latest_file, 'rb'), filename: File.basename(latest_file) }
    end
  end

  # Download any other URL via open-uri
  def download_generic
    file = URI.open(@url)
    filename = File.basename(URI.parse(@url).path.presence || 'download')
    { io: file, filename: filename }
  rescue OpenURI::HTTPError => e
    raise "Failed to download from URL: #{e.message}"
  end
end
