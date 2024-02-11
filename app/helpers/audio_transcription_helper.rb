module AudioTranscriptionHelper
  def segment_timestemp(segment)
    "#{time_to_string(segment['start'])} - #{time_to_string(segment['end'])}"
  end

  private
    def time_to_string(time_in_seconds)
      hours = time_in_seconds.divmod(3600)[0]
      minutes = time_in_seconds.divmod(60)[0] % 60
      seconds = time_in_seconds % 60

      # Format to two digits with leading zeros
      hours_str = format("%02d", hours)
      minutes_str = format("%02d", minutes)
      seconds_str = format("%02d", seconds)

      "#{hours_str}:#{minutes_str}:#{seconds_str}"
    end
end
