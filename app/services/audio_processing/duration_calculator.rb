class AudioProcessing::DurationCalculator
  def self.calculate(audio)
    return unless audio.respond_to?(:path)

    command = "ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 #{audio.path}"
    duration_in_seconds = `#{command}`.strip.to_f
    duration_in_seconds.round
   rescue
       0 # Return 0 or handle error appropriately
   end
end
