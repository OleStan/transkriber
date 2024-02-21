class AudioTranscriptionsController < ApplicationController
  before_action :find_audio_transcription, only: %i[transcribe show]

  def index
    @transcriptions = AudioTranscription.page(params[:page])
  end

  def show; end

  def create
    @transcription = AudioTranscription.new(transcriptions_params)
    respond_to do |format|
      if @transcription.save
        format.html { redirect_to audio_transcription_path(@transcription) }
      else
        format.html { redirect_to root_path }
      end
    end
  end

  def transcribe
    @result = TranscribeAudioTranscription.new(id: params[:id]).perform

    #
    # text_from_audio = @transcription.transcribe_audio.join
    #
    # @transcription.update(transcription: text_from_audio)

    respond_to do |format|
      format.turbo_stream { render turbo_stream: turbo_stream.update("result_div", partial: "audio_transcriptions/result", locals: { transcription: @transcription.result }) }
    end
  end

  private

  def find_audio_transcription
    @transcription = AudioTranscription.find(params[:id])
  end

  def transcriptions_params
    params.require(:audio_transcription).permit(:audio)
  end
end
