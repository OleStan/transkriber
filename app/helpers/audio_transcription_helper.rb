module AudioTranscriptionHelper
  def segment_timestamp(segment)
    # "#{time_to_string(segment['start'])} - #{time_to_string(segment['end'])}"
    # only start time
    float_to_timestamp(segment['start'])
  end

  private
    def float_to_timestamp(time_in_seconds)
      hours = (time_in_seconds / 3600).floor
      minutes = ((time_in_seconds % 3600) / 60).floor
      seconds = (time_in_seconds % 60).floor

      format("%02d:%02d:%02d", hours, minutes, seconds)
    end
end
