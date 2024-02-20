# frozen_string_literal: true

class Ajax::TranscriptionsController < ApplicationController
  def index
    @transcriptions = AudioTranscription.paginate(page: params[:page])

    render json: @transcriptions, each_serializer: Ajax::Transcriptions::IndexSerializer
  end

  def show
    @transcription = AudioTranscription.find(params[:id])

    render json: @transcription, serializer: Ajax::Transcriptions::ShowSerializer
  end
end
