# frozen_string_literal: true

class Transcriptions::CreateTranscription < ActiveInteractor::Base
  def perform
    context.audio_transcription = Transcription.create!(
      audio: { io: context.io, filename: context.filename },
      title: File.basename(context.filename, '.*'),
      duration: AudioProcessing::DurationCalculator.calculate(
        context.io.respond_to?(:path) ? context.io.path : Tempfile.new.path
      )
    )
  rescue StandardError => e
    context.fail!(e.message)
  end
end
