# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Transcriptions::Exporter do
  let(:transcription_json) do
    {
      'segments' => [
        { 'id' => 0, 'text' => ' Hello world', 'start' => 0.0,    'end' => 2.5 },
        { 'id' => 1, 'text' => ' How are you', 'start' => 2.5,    'end' => 5.123 },
        { 'id' => 2, 'text' => ' Fine thanks',  'start' => 3661.0, 'end' => 3663.0 }
      ]
    }
  end

  let(:transcription) { build_stubbed(:transcription, transcription_json: transcription_json) }

  describe '.call' do
    it 'calls the exporter and returns content' do
      result = described_class.call(transcription, 'txt')
      expect(result).to be_a(String)
    end

    it 'raises ArgumentError for unknown format' do
      expect { described_class.call(transcription, 'pdf') }
        .to raise_error(ArgumentError, /Unknown format/)
    end
  end

  describe '#export as txt' do
    subject(:content) { described_class.call(transcription, 'txt') }

    it 'returns one line per segment' do
      expect(content.lines.count).to eq(3)
    end

    it 'strips leading/trailing whitespace from segment text' do
      expect(content).to include('Hello world')
      expect(content).not_to include(' Hello world')
    end

    it 'contains no timestamps' do
      expect(content).not_to match(/\d{2}:\d{2}:\d{2}/)
    end

    context 'when transcription_json is nil' do
      let(:transcription) { build_stubbed(:transcription, :without_json) }

      it 'returns empty string' do
        expect(content).to eq('')
      end
    end

    context 'when transcription_json is an array (chunked)' do
      let(:transcription) { build_stubbed(:transcription, :chunked_json) }

      it 'uses segments from the first chunk' do
        expect(content).to include('First chunk')
      end
    end
  end

  describe '#export as srt' do
    subject(:content) { described_class.call(transcription, 'srt') }

    it 'has sequential entry numbers starting at 1' do
      expect(content).to match(/^1\n/)
      expect(content).to match(/^2\n/)
      expect(content).to match(/^3\n/)
    end

    it 'uses comma as millisecond separator in timestamps' do
      expect(content).to match(/\d{2}:\d{2}:\d{2},\d{3}/)
    end

    it 'does NOT use dot as millisecond separator' do
      expect(content).not_to match(/\d{2}:\d{2}:\d{2}\.\d{3}/)
    end

    it 'formats hours correctly for segments over 1 hour' do
      expect(content).to include('01:01:01,000')
    end

    it 'formats fractional seconds as milliseconds' do
      # 5.123s = 00:00:05,123
      expect(content).to include('00:00:05,123')
    end

    it 'separates entries with blank lines' do
      expect(content).to include("\n\n")
    end

    context 'when transcription_json is nil' do
      let(:transcription) { build_stubbed(:transcription, :without_json) }

      it 'returns empty string' do
        expect(content).to eq('')
      end
    end
  end

  describe '#export as vtt' do
    subject(:content) { described_class.call(transcription, 'vtt') }

    it 'starts with WEBVTT header' do
      expect(content).to start_with("WEBVTT\n\n")
    end

    it 'uses dot as millisecond separator in timestamps' do
      expect(content).to match(/\d{2}:\d{2}:\d{2}\.\d{3}/)
    end

    it 'does NOT use comma as millisecond separator' do
      expect(content).not_to match(/\d{2}:\d{2}:\d{2},\d{3}/)
    end

    it 'formats fractional seconds as milliseconds' do
      # 5.123s = 00:00:05.123
      expect(content).to include('00:00:05.123')
    end

    it 'contains segment text' do
      expect(content).to include('Hello world')
    end
  end

  describe 'timestamp edge cases' do
    let(:transcription_json) do
      { 'segments' => [{ 'id' => 0, 'text' => ' Test', 'start' => nil, 'end' => nil }] }
    end

    it 'handles nil timestamps gracefully in srt format' do
      result = described_class.call(transcription, 'srt')
      expect(result).to include('00:00:00,000 --> 00:00:00,000')
    end

    it 'handles nil timestamps gracefully in vtt format' do
      result = described_class.call(transcription, 'vtt')
      expect(result).to include('00:00:00.000 --> 00:00:00.000')
    end
  end
end
