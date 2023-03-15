class PagesController < ApplicationController
  def index
    @transcription = AudioTranscription.new
  end
end
