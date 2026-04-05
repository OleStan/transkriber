# frozen_string_literal: true

class Transcriptions::Exporter
  FORMATS = %w[txt srt vtt].freeze

  def self.call(transcription, format)
    new(transcription, format).export
  end

  def initialize(transcription, format)
    @transcription = transcription
    @format = format.to_s.downcase
    raise ArgumentError, "Unknown format: #{@format}" unless FORMATS.include?(@format)
  end

  def export
    send("to_#{@format}")
  end

  private

  def segments
    return [] if @transcription.transcription_json.nil?
    json = @transcription.transcription_json
    json = json.first if json.is_a?(Array)
    json['segments'] || []
  end

  def to_txt
    segments.map { |s| s['text'].strip }.join("\n")
  end

  def to_srt
    segments.each_with_index.map do |s, i|
      "#{i + 1}\n#{srt_time(s['start'])} --> #{srt_time(s['end'])}\n#{s['text'].strip}"
    end.join("\n\n")
  end

  def to_vtt
    body = segments.each_with_index.map do |s, i|
      "#{i + 1}\n#{vtt_time(s['start'])} --> #{vtt_time(s['end'])}\n#{s['text'].strip}"
    end.join("\n\n")
    "WEBVTT\n\n#{body}"
  end

  def srt_time(seconds)
    return '00:00:00,000' if seconds.nil?
    ms = ((seconds % 1) * 1000).round
    h, r = seconds.to_i.divmod(3600)
    m, s = r.divmod(60)
    format('%02d:%02d:%02d,%03d', h, m, s, ms)
  end

  def vtt_time(seconds)
    return '00:00:00.000' if seconds.nil?
    ms = ((seconds % 1) * 1000).round
    h, r = seconds.to_i.divmod(3600)
    m, s = r.divmod(60)
    format('%02d:%02d:%02d.%03d', h, m, s, ms)
  end
end
