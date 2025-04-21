# app/services/media_download_service.rb
require 'open-uri'
require 'tmpdir'
require 'open3'

class MediaDownloadService
  YOUTUBE_HOSTS = [
    %r{\Ahttps?://(www\.)?youtube\.com},
    %r{\Ahttps?://youtu\.be}
  ].freeze

  def initialize(url)
    @url         = url
    @downloader  = detect_downloader
  end

  def download
    youtube_url? ? download_from_youtube : download_generic
  end

  private

  def detect_downloader
    if command_exist?('yt-dlp')
      ['yt-dlp']
    elsif command_exist?('youtube-dl')
      ['youtube-dl']
    elsif python_module_exist?
      ['python3', '-m', 'yt_dlp']
    else
      raise <<~ERR
        Required downloader not found.
        • On macOS: brew install yt-dlp
        • On Ubuntu: pip3 install --user yt-dlp
      ERR
    end
  end

  def command_exist?(cmd)
    system("which #{cmd} > /dev/null 2>&1")
  end

  def python_module_exist?
    # we only care if `python3 -m yt_dlp --version` exits zero
    _, _, status = Open3.capture3('python3', '-m', 'yt_dlp', '--version')
    status.success?
  end

  def youtube_url?
    YOUTUBE_HOSTS.any? { |rg| @url.match?(rg) }
  end

  def download_from_youtube
    Dir.mktmpdir('media_dl') do |dir|
      template = File.join(dir, '%(title)s.%(ext)s')
      cmd = @downloader +
            ['-f', 'bestaudio',
             '--extract-audio',
             '--audio-format', 'mp3',
             '--no-progress',
             '--no-warnings',
             '--no-color',
             '-o', template,
             @url]

      stdout, stderr, status = Open3.capture3(*cmd)
      unless status.success?
        raise "Download failed (#{cmd.join(' ')}):\n#{stderr}"
      end

      files = Dir.glob(File.join(dir, '*'))
      raise 'No files were downloaded.' if files.empty?

      latest = files.max_by { |f| File.mtime(f) }
      { io: File.open(latest, 'rb'), filename: File.basename(latest) }
    end
  end

  def download_generic
    file     = URI.open(@url)
    filename = File.basename(URI.parse(@url).path.presence || 'download')
    { io: file, filename: filename }
  rescue OpenURI::HTTPError => e
    raise "Failed to download URL: #{e.message}"
  end
end
