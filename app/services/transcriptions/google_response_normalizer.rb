# frozen_string_literal: true

class Transcriptions::GoogleResponseNormalizer
  SENTENCE_ENDINGS = /[.!?]$/.freeze
  WORDS_PER_SEGMENT = 10

  def self.call(google_response)
    new(google_response).normalize
  end

  def initialize(google_response)
    @google_response = google_response
  end

  def normalize
    words = extract_words
    return { 'text' => '', 'segments' => [] } if words.empty?

    segments = build_segments(words)
    full_text = segments.map { |s| s['text'] }.join(' ')

    { 'text' => full_text, 'segments' => segments }
  end

  private

  def extract_words
    # google_response is an array of results; each result is an array of alternatives.
    # We take the first (best) alternative from each result.
    @google_response.flatten(1).map do |alternative|
      # alternative is a Hash with :words key (already processed by read_response)
      alternative[:words] || []
    end.flatten
  end

  def build_segments(words)
    groups = group_words(words)
    groups.each_with_index.map do |group, idx|
      {
        'id'    => idx,
        'text'  => " #{group.map { |w| w[:word] }.join(' ')}",
        'start' => group.first[:start_time].to_f,
        'end'   => group.last[:end_time].to_f
      }
    end
  end

  def group_words(words)
    groups = []
    current = []

    words.each do |word|
      current << word
      if current.length >= WORDS_PER_SEGMENT || sentence_end?(word[:word])
        groups << current
        current = []
      end
    end

    groups << current unless current.empty?
    groups
  end

  def sentence_end?(word)
    word.match?(SENTENCE_ENDINGS)
  end
end
