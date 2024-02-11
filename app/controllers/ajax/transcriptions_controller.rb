# frozen_string_literal: true

class Ajax::TranscriptionsController < ApplicationController
  def index
    @transcriptions = AudioTranscription.paginate(page: params[:page])

    render json: @transcriptions, each_serializer: Ajax::Transcriptions::IndexSerializer
  end
end
