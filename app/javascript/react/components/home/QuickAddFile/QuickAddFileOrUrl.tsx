import React, { useState, useRef, useEffect } from 'react';
import Sheet from '@mui/joy/Sheet';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogContent from '@mui/joy/DialogContent';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import { DialogTitle, ModalClose } from '@mui/joy';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import LinearProgress from '@mui/joy/LinearProgress';

import LanguageSelector from './LanguageSelector';
import { useNotification } from '../../../contexts/NotificationContext';
import { useAppNavigate } from '../../../helpers/navigationHelpers';
import { useCreateTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';

type InputType = 'file' | 'url';

const QuickAddFileOrUrl = () => {
  const [inputType, setInputType] = useState<InputType>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [language, setLanguage] = useState<string>(
    () => localStorage.getItem('selectedLanguage') || 'auto'
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();
  const { goToTranscriptions } = useAppNavigate();
  const [createTranscription] = useCreateTranscriptionMutation();

  /* ---------- Handlers --------------------------------------------------- */
  const resetState = () => {
    setSelectedFile(null);
    setUrlInput('');
    setLanguage(localStorage.getItem('selectedLanguage') || 'auto');
    setIsSubmitting(false);
  };

  const handleBrowse = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
        showNotification('Please select an audio or video file.', 'danger');
        return;
      }
      setSelectedFile(file);
      setOpenDialog(true);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange({ target: { files: [file] } } as any);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleSubmit = () => {
    if (inputType === 'file' && !selectedFile) {
      showNotification('Please select a file.', 'danger');
      return;
    }
    if (inputType === 'url' && !urlInput.trim()) {
      showNotification('Please enter a URL.', 'danger');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    if (inputType === 'file' && selectedFile) {
      formData.append('audio_transcription[audio]', selectedFile);
    }
    if (inputType === 'url') {
      formData.append('audio_transcription[url]', urlInput.trim());
    }

    formData.append('audio_transcription[language]', language);

    createTranscription(formData)
      .unwrap()
      .then((res) => {
        localStorage.setItem('selectedLanguage', language);
        showNotification('Запит відправлено успішно!', 'success');
        goToTranscriptions(res.transcriptionId);
        setOpenDialog(false);
        resetState();
      })
      .catch((err) => {
        showNotification(err.errors || 'Error', 'danger');
        setIsSubmitting(false);
      });
  };

  /* ---------- Effects ---------------------------------------------------- */
  useEffect(() => {
    const stored = localStorage.getItem('selectedLanguage');
    if (stored) setLanguage(stored);
  }, []);

  return (
    <Sheet variant="outlined" sx={{ p: 4, borderRadius: 8, mb: 2 }}>
      <Typography level="body-md" sx={{ mb: 1 }}>
        Choose your transcription source:
      </Typography>
      <Tabs value={inputType} onChange={(_, v) => setInputType(v as InputType)} sx={{ mb: 2 }}>
        <TabList>
          <Tab value="file">File</Tab>
          <Tab value="url">URL</Tab>
        </TabList>
      </Tabs>
      {/* Show file upload area only if inputType is file */}
      {inputType === 'file' && (
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            border: '2px dashed #90caf9',
            borderRadius: 8,
            p: 4,
            textAlign: 'center',
            bgcolor: '#f9f9fb',
            mb: 2,
            cursor: 'pointer',
          }}
          onClick={handleBrowse}
        >
          <DriveFolderUploadIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
          <Typography level="body-lg">
            Drag & drop your audio/video file here, or <span style={{ color: '#1976d2', textDecoration: 'underline' }}>browse to upload</span>.
          </Typography>
          <Typography level="body-sm" sx={{ mt: 1, color: '#888' }}>
            Supported formats: MP3, WAV, MP4, etc.
          </Typography>
          {isSubmitting && <LinearProgress sx={{ mt: 2 }} />}
          {isSubmitting && (
            <Typography level="body-sm" sx={{ mt: 1 }}>
              {selectedFile ? 'Uploading…' : ''}
            </Typography>
          )}
          <input
            type="file"
            accept="audio/*,video/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </Box>
      )}
      {/* Show URL input area only if inputType is url */}
      {inputType === 'url' && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Input
            placeholder="Paste audio/video URL here"
            fullWidth
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            sx={{ mb: 2, flex: 1 }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setOpenDialog(true);
              }
            }}
          />
          <Button
            variant="solid"
            color="primary"
            sx={{ height: '40px', alignSelf: 'center', mb: 2 }}
            disabled={!urlInput.trim()}
            onClick={() => setOpenDialog(true)}
          >
            Submit
          </Button>
        </Box>
      )}
      <LanguageSelector language={language} setLanguage={setLanguage} />
      <Modal
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetState();
        }}
      >
        <ModalDialog>
          <ModalClose
            onClick={() => {
              setOpenDialog(false);
              resetState();
            }}
          />
          <DialogTitle>{inputType === 'file' ? 'Transcribe File' : 'Transcribe URL'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {inputType === 'file' && selectedFile && (
                <Typography>
                  File: <strong>{selectedFile.name}</strong> (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
              {inputType === 'url' && (
                <Typography>
                  URL: <strong>{urlInput}</strong>
                </Typography>
              )}
              <Typography>
                Select the language for transcription. Choose "Auto" for automatic detection.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setOpenDialog(false);
                    resetState();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant='solid'
                  color='primary'
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Transcribing...' : 'Transcribe'}
                </Button>
              </Box>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Sheet>
  );
};

export default QuickAddFileOrUrl;
