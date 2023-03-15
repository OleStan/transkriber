class AudioTranscriptionsController < ApplicationController
  before_action :find_audio_transcription, only: %i[transcribe show]

  def show; end

  def create
    @transcription = AudioTranscription.new(transcriptions_params)
    if @transcription.save
      p "saved --------------------------------"
      redirect_to audio_transcription_path(@transcription)
    else
      render "fdggdfgdf"
    end
  end

  def transcribe
    @transcription.transcribe_audio
    p "end"
  end

  private

  def find_audio_transcription
    @transcription = AudioTranscription.find(params[:id])
  end

  def transcriptions_params
    params.require(:audio_transcription).permit(:audio)
  end
end
