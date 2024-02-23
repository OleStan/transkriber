import React, { useState, useRef, useCallback } from 'react';
import Sheet from '@mui/joy/Sheet';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { Transition } from 'react-transition-group';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import { useNotification } from '../../../contexts/NotificationContext';
import { useCreateTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';

const QuickAddFile = () => {
  const [createTranscription] = useCreateTranscriptionMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { showNotification } = useNotification();
  // const navigate = useNavigate();

  // const redirectToTranscriptionShow = (transcriptionId: string) => {
  //   navigate(`/transcriptions/${transcriptionId}`);
  // };

  // const handleSubmit = () => {
  //   if (selectedFile) {
  //     const formData = new FormData();
  //     formData.append('audio_transcription[audio]', selectedFile);

  //     createTranscription(formData)
  //       .unwrap()
  //       .then((response) => {
  //         showNotification('File uploaded successfully!', 'success');
  //         redirectToTranscriptionShow(response.id);
  //       })
  //       .catch((err) => {
  //         showNotification('Error uploading file.', 'danger');
  //       });
  //   }
  //   setOpenDialog(false);
  // };
  const handleFileUpload = (file) => {
    // Check file type before upload
    if (!file.type.startsWith('audio/')) {
      showNotification('Please select an audio file.', 'danger');
      return;
    }

    setSelectedFile(file);
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('audio_transcription[audio]', selectedFile);

      createTranscription(formData)
        .unwrap()
        .then((response) => {
          showNotification('File uploaded successfully!', 'success');
          // redirectToTranscriptionShow(response.id);
        })
        .catch((err) => {
          showNotification('Error uploading file.', 'danger');
        });
    }
    setOpenDialog(false);
  };

  const handleBrowse = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null);
  };

  return (
    <>
      <Sheet
        variant='outlined'
        color='neutral'
        sx={{
          p: 12,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '2px solid',
          borderColor: 'divider',
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

      <Transition in={openDialog} timeout={400}>
        {(state: string) => (
          <Modal
            keepMounted
            open={!['exited', 'exiting'].includes(state)}
            onClose={() => setOpenDialog(false)}
            slotProps={{
              backdrop: {
                sx: {
                  opacity: 0,
                  backdropFilter: 'none',
                  transition: `opacity 400ms, backdrop-filter 400ms`,
                  ...{
                    entering: { opacity: 1, backdropFilter: 'blur(8px)' },
                    entered: { opacity: 1, backdropFilter: 'blur(8px)' },
                  }[state],
                },
              },
            }}
            sx={{
              visibility: state === 'exited' ? 'hidden' : 'visible',
            }}
          >
            <ModalDialog
              sx={{
                opacity: 0,
                transition: `opacity 300ms`,
                ...{
                  entering: { opacity: 1 },
                  entered: { opacity: 1 },
                }[state],
              }}
            >
              <DialogTitle>Transition modal</DialogTitle>
              <DialogContent>
                <Stack spacing={4}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Button onClick={handleCloseDialog} color={'danger'}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Upload</Button>
                  </Box>
                </Stack>
              </DialogContent>
            </ModalDialog>
          </Modal>
        )}
      </Transition>
    </>
  );
};

export default QuickAddFile;
