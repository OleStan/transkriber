class AudioProcessing::DurationCalculator
  def self.calculate(audio_path)
    movie = FFMPEG::Movie.new(audio_path)
    duration = movie.duration # This returns the duration of the audio in seconds as a float
    duration
  rescue StandardError => e
    Rails.logger.error("AudioProcessing::DurationCalculator: Error calculating duration for #{audio_path}: #{e.message}")
    nil
  end
end
