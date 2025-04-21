class TranscriptionsController < ApplicationController
  before_action :find_audio_transcription, only: %i[transcribe show]

  def index
    @transcriptions = Transcription.page(params[:page])
  end

  def show; end

  def create
    @transcription = Transcription.new(transcriptions_params)

    if video_file?(transcriptions_params[:audio])
      video_blob = transcriptions_params[:audio]
      audio_blob = VideoToAudioService.call(video_blob)
      @transcription.audio.attach(audio_blob)
    end

    respond_to do |format|
      if @transcription.save
        format.html { redirect_to audio_transcription_path(@transcription) }
      else
        format.html { redirect_to root_path }
      end
    end
  end

  def transcribe
    @result = Transcriptions::Transcribe.new(id: params[:id]).perform

    #
    # text_from_audio = @transcription.transcribe_audio.join
    #
    # @transcription.update(transcription: text_from_audio)

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.update('result_div', partial: 'audio_transcriptions/result',
                                                               locals: { transcription: @transcription.result })
      end
    end
  end

  private

  def find_audio_transcription
    @transcription = Transcription.find(params[:id])
  end

  def transcriptions_params
    params.require(:audio_transcription).permit(:audio, :language)
  end

  def video_file?(file)
    file.content_type.start_with?('video/')
  end
end
