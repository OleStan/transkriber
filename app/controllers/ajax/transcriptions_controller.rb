# frozen_string_literal: true

class Ajax::TranscriptionsController < ApplicationController
  def index
    @transcriptions = AudioTranscription.select(:id, :created_at).page(params[:page])

    render json: {
      transcriptions: ActiveModel::SerializableResource.new(@transcriptions,
                                                            each_serializer: Ajax::Transcriptions::IndexSerializer),
      page: params[:page].to_i,
      total_pages: @transcriptions.total_pages,
      total_count: @transcriptions.total_count
    }
  end

  def show
    @transcription = AudioTranscription.find(params[:id])

    render json: @transcription, serializer: Ajax::Transcriptions::ShowSerializer
  end

  def create
    @result = AudioTranscription::Create.new(audio: transcriptions_params[:audio]).perform

    if @result.save
      render json: { data: 'success' }
    else
      render json: { data: 'error' }
    end
  end

  private

  def transcriptions_params
    params.require(:audio_transcription).permit(:audio)
  end
end
