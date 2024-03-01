# frozen_string_literal: true

class TranscriptionChannel < ApplicationCable::Channel
  def subscribed
    # TODO add secutrity via Devise
    stream_from "transcription_channel_#{params[:room]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
