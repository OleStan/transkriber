class AudioProcessing::DurationCalculator
  def self.calculate(audio_path)
    movie = FFMPEG::Movie.new(audio_path)
    movie.duration # This returns the duration of the audio in seconds as a float
  rescue StandardError => e
    puts "An error occurred: #{e.message}"
    0 # Return 0 or handle error appropriately
  end
end
