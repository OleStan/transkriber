class PagesController < ApplicationController
  def index
    @transcription = AudioTranscription.new
  end

  def root

  end
end
