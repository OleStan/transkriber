# frozen_string_literal: true

class Ajax::TranscriptionsController < ApplicationController
  before_action :set_transcription, only: %i[show destroy]

  def index
    result = Transcriptions::Index.perform(page: params[:page])

    if result.success?
      render json: result.data
    else
      render json: { errors: result.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    render json: @transcription, serializer: Ajax::Transcriptions::ShowSerializer
  end

  def create
    result = Transcriptions::Create.perform(
      audio: transcriptions_params[:audio],
      url: transcriptions_params[:url],
      language: transcriptions_params[:language]
    )

    if result.success?
      render json: result.data, status: :created
    else
      render json: { errors: result.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    result = Transcriptions::Delete.perform(id: @transcription.id, page: params[:page])

    if result.success?
      render json: result.data
    else
      render json: { errors: result.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_transcription
    @transcription = Transcription.find(params[:id])
  end

  def transcriptions_params
    params
      .require(:audio_transcription)
      .permit(:audio, :url, :language)
  end
end
