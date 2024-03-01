# frozen_string_literal: true

class Ajax::TranscriptionsController < ApplicationController

  def index
    result = Transcriptions::Index.perform(page: params[:page])

    if result.success?
      render json: result.data
    else
      render json: { data: result.errors.full_messages.join(', ') }
    end
  end

  def show
    transcription = Transcription.find(params[:id])

    render json: transcription, serializer: Ajax::Transcriptions::ShowSerializer
  end

  def create
    result = Transcriptions::Create.perform(
      audio: transcriptions_params[:audio],
      language: transcriptions_params[:language]
    )

    if result.success?
      render json: result.data
    else
      render json: result.errors.full_messages.join(', ')
    end
  end

  private

  def transcriptions_params
    params.require(:audio_transcription).permit(:audio, :language)
  end
end
