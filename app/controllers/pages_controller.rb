class PagesController < ApplicationController
  def index
    @transcription = Transcription.new
  end

  def root; end
end
