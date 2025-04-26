class Transcriptions::ConvertVideoToAudio < ActiveInteractor::Base
  def perform
    ext = File.extname(context.filename).delete('.').downcase
    if %w[mp4 webm mov mpeg].include?(ext)
      audio_blob = VideoToAudioService.call(context.io)
      context.io = audio_blob[:io]
      context.filename = audio_blob[:filename]
    end
  rescue StandardError => e
    context.fail!(e.message)
  end
end
