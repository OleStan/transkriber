import React, { useState, useRef, useCallback, useEffect } from 'react';
import Sheet from '@mui/joy/Sheet';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogContent from '@mui/joy/DialogContent';
import LanguageSelector from './LanguageSelector'; // Adjust the path as necessary
import { useNotification } from '../../../contexts/NotificationContext';
import { useAppNavigate } from '../../../helpers/navigationHelpers';
import { useCreateTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import { DialogTitle, ModalClose } from '@mui/joy';

const QuickAddFile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createTranscription] = useCreateTranscriptionMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('selectedLanguage') || 'auto';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();
  const { goToTranscriptions } = useAppNavigate();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file) {
      handleFileUpload(file);
      // Clear the input field to allow re-uploading the same file if needed
      event.target.value = '';
    }
  };

  const handleSubmit = () => {
    if (selectedFile && language) {
      setIsSubmitting(true); // Indicate submission start
      const formData = new FormData();
      formData.append('audio_transcription[audio]', selectedFile);
      formData.append('audio_transcription[language]', language);

      createTranscription(formData)
        .unwrap()
        .then((response) => {
          localStorage.setItem('selectedLanguage', language);
          showNotification('File uploaded successfully!', 'success');
          goToTranscriptions(response.transcriptionId);
          resetModalState(); // Reset modal state for a new upload
        })
        .catch((err) => {
          showNotification(err.error, 'danger');
          setIsSubmitting(false); // Reset submitting state on error
        });
    } else {
      showNotification('Please select a language.', 'danger');
    }
  };

  const resetModalState = () => {
    setOpenDialog(false);
    setSelectedFile(null);
    setLanguage(localStorage.getItem('selectedLanguage') || 'auto');
    setIsSubmitting(false); // Reset the submitting state
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleCloseDialog = () => {
    resetModalState(); // Reset modal state when closed
  };

  const handleFileUpload = (file: File) => {
    // Check file type before upload
    if (!file.type.startsWith('audio/')) {
      showNotification('Please select an audio file.', 'danger');
      return;
    }
    setSelectedFile(file);
    setOpenDialog(true);
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    // If the language exists in localStorage, set it
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  return (
    <>
      <Sheet
        variant='outlined'
        color='neutral'
        sx={{
          px: 16,
          minHeight: 300,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid',
          borderColor: 'divider',
          justifyContent: 'center',
          backgroundSize: 'cover',
          backgroundPosition: 'end',
          '&:hover': {
            border: '2px dashed',
            borderColor: 'primary.softColor',
          },
          outline: 'none',
          transition: 'border-color 0.3s',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <DriveFolderUploadIcon />
        <Typography level='title-md'>Add new transcription</Typography>
        <input
          ref={fileInputRef}
          type='file'
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Button size='lg' variant='outlined' onClick={handleBrowse}>
          Browse a file
        </Button>
      </Sheet>

      <Modal open={openDialog} onClose={handleCloseDialog} aria-labelledby='transcribe-modal-title'>
        <ModalDialog>
          <ModalClose onClick={() => setOpenDialog(false)} />
          <DialogTitle id='transcribe-modal-title'>Transcribe Audio</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {selectedFile && (
                <Typography>
                  Selected file: <strong>{selectedFile.name}</strong> (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
              <LanguageSelector language={language} setLanguage={setLanguage} />
              <Typography variant='body2' color='text.secondary'>
                Select the language for transcription. Choose "Auto" to let the system detect the
                language automatically.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant='outlined' onClick={handleCloseDialog}>
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

export default QuickAddFile;
