class VideoToAudioService
  def self.call(video_blob)
    video_path = ActiveStorage::Blob.service.path_for(video_blob.key)
    audio_path = Tempfile.new(['audio', '.mp3']).path

    system("ffmpeg -i #{Shellwords.escape(video_path)} -q:a 0 -map a #{Shellwords.escape(audio_path)}")

    raise 'Audio extraction failed' unless File.exist?(audio_path)

    ActiveStorage::Blob.create_and_upload!(
      io: File.open(audio_path),
      filename: "extracted_audio_#{video_blob.filename.base}.mp3",
      content_type: 'audio/mpeg'
    )
  ensure
    File.delete(audio_path) if File.exist?(audio_path)
  end
end
