class Transcriptions::AttachAudioContext < ActiveInteractor::Context::Base
  attributes :audio_transcription, :io, :filename
  validates :audio_transcription, presence: true, on: :calling
end

class Transcriptions::AttachAudio < ActiveInteractor::Base
  def perform
    transcription = context.audio_transcription
    context.io.rewind if context.io.respond_to?(:rewind)
    transcription.audio.attach(io: context.io, filename: context.filename)
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(error: e.message)
  end
end
