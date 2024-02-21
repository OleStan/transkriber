import React, { useCallback } from 'react';
import Sheet from '@mui/joy/Sheet';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { useCreateTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';

const QuickAddFile = () => {
  const [createTranscription, { isLoading, error }] = useCreateTranscriptionMutation();
  const fileInputRef = React.useRef(null);

  const handleFileUpload = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    console.log('formData', formData);
    createTranscription(formData).unwrap()
      .then((response) => {
        console.log('success');
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleBrowse = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleFileUpload(file);
    console.log(file);
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    // Handle the file upload here
    console.log(file);
  }, []);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
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
  );
};

export default QuickAddFile;
