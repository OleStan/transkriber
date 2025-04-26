class Transcriptions::FetchMedia < ActiveInteractor::Base
  def perform
    if context.url.present?
      downloaded = MediaDownloadService.new(context.url).download
      context.io = downloaded[:io]
      context.filename = downloaded[:filename]
    else
      context.io = context.audio.tempfile
      context.filename = context.audio.original_filename
    end
  rescue StandardError => e
    context.fail!(e.message)
  end
end
