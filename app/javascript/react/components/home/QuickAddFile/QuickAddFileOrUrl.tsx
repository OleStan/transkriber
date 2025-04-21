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
    <>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button
          variant={inputType === 'file' ? 'solid' : 'outlined'}
          onClick={() => {
            setInputType('file');
            resetState();
            setOpenDialog(false);
          }}
        >
          File
        </Button>
        <Button
          variant={inputType === 'url' ? 'solid' : 'outlined'}
          onClick={() => {
            setInputType('url');
            resetState();
          }}
        >
          URL
        </Button>
      </Box>

      {inputType === 'file' && (
        <Sheet
          variant='outlined'
          color='neutral'
          sx={{
            px: 16,
            minHeight: 300,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid',
            borderColor: 'divider',
            '&:hover': {
              border: '2px dashed',
              borderColor: 'primary.softColor',
            },
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <DriveFolderUploadIcon fontSize='large' />
          <Typography level='title-md' sx={{ mt: 1, mb: 2 }}>
            Add new transcription
          </Typography>
          <input
            ref={fileInputRef}
            type='file'
            accept='audio/*,video/*'
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Button size='lg' variant='outlined' onClick={handleBrowse}>
            Browse a file
          </Button>
        </Sheet>
      )}

      {inputType === 'url' && (
        <Sheet
          variant='outlined'
          color='neutral'
          sx={{ p: 4, borderRadius: 2, mb: 2 }}
          onClick={() => {}}
        >
          <Typography level='title-sm' sx={{ mb: 1 }}>
            Enter media URL
          </Typography>
          <Input
            placeholder='https://...'
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            endDecorator={
              <Button size='sm' onClick={() => setOpenDialog(true)}>
                Next
              </Button>
            }
          />
        </Sheet>
      )}

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
              <LanguageSelector language={language} setLanguage={setLanguage} />
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
    </>
  );
};

export default QuickAddFileOrUrl;
