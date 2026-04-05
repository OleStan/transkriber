// Frontend locales for English

const en = {
  transcription: {
    table: {
      name: 'Name',
      date: 'Date',
      duration: 'Duration',
      status: 'Status',
      actions: 'Actions',
      noTranscriptions: 'No transcriptions found.',
    },
    status: {
      completed: 'Completed',
      in_progress: 'Transcribing…',
      pending: 'Pending',
      uploading: 'Uploading…',
      transcribing: 'Transcribing…',
      error: 'Error',
    },
    general: {
      delete: 'Delete',
      error: 'Error occurred:',
    },
    show: {
      copyWithTimestamps: 'Copy with Timestamps',
      copiedToClipboard: 'Copied to clipboard',
      noSegments: 'No transcription segments available.',
    },
  },
  home: {
    recentTranscriptionsTable: {
      table: {
        name: 'Name',
        status: 'Status',
        date: 'Uploaded',
        actions: 'Actions',
        noTranscriptions: 'No transcriptions found.',
      },
      status: {
        completed: 'Completed',
        in_progress: 'Transcribing',
        transcribing: 'Transcribing…',
        uploading: 'Uploading…',
        error: 'Error',
      },
      general: {
        transcriptions: 'Recent Transcriptions',
        view: 'View',
        delete: 'Delete',
        error: 'Error occurred:',
      },
    },
  },
  quickAddFile: {
    quickAddFileOrUrl: {
      fileTab: 'File',
      urlTab: 'URL',
      dragDrop: 'Drag & drop your audio/video file here, or ',
      browse: 'browse to upload',
      supportedFormats: 'Supported formats: MP3, WAV, MP4, etc.',
      pasteUrl: 'Paste audio/video URL here',
      invalidFile: 'Please select an audio or video file.',
      noFileSelected: 'Please select a file.',
      noUrlEntered: 'Please enter a URL.',
      requestSuccess: 'Your transcription request has been sent successfully!',
      processing: 'Your file will be processed and transcription will be available shortly!',
      error: 'Error occurred:',
      modalTitleFile: 'Transcribe File',
      modalTitleUrl: 'Transcribe URL',
      submit: 'Submit',
      transcribe: 'Transcribe',
      cancel: 'Cancel',
      uploading: 'Uploading…',
      transcribing: 'Transcribing…',
      selectLanguage: 'Select the language for transcription. Choose "Auto" for automatic detection.',
      fileLabel: 'File:',
      urlLabel: 'URL:',
    },
  },
};

export default en;
