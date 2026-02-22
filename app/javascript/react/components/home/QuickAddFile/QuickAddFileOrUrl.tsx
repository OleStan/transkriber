import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import LanguageSelector from './LanguageSelector';
import { useNotification } from '../../../contexts/NotificationContext';
import { useAppNavigate } from '../../../helpers/navigationHelpers';
import { useCreateTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import en from '../../../locales/en';

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
        showNotification(en.quickAddFile.quickAddFileOrUrl.invalidFile, 'danger');
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
      showNotification(en.quickAddFile.quickAddFileOrUrl.noFileSelected, 'danger');
      return;
    }
    if (inputType === 'url' && !urlInput.trim()) {
      showNotification(en.quickAddFile.quickAddFileOrUrl.noUrlEntered, 'danger');
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
        showNotification(en.quickAddFile.quickAddFileOrUrl.processing, 'success');
        goToTranscriptions(res.transcriptionId);
        setOpenDialog(false);
        resetState();
      })
      .catch((err) => {
        showNotification(err.errors || en.quickAddFile.quickAddFileOrUrl.error, 'danger');
        setIsSubmitting(false);
      });
  };

  /* ---------- Effects ---------------------------------------------------- */
  useEffect(() => {
    const stored = localStorage.getItem('selectedLanguage');
    if (stored) setLanguage(stored);
  }, []);

  return (
    <Paper 
      sx={{ 
        bgcolor: '#243947',
        color: 'white',
        p: 4, 
        borderRadius: '12px', 
        mb: 2, 
        border: '1px solid #3d505c',
        fontFamily: '"Spline Sans", "Noto Sans", sans-serif'
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: '#3d505c', mb: 3 }}>
        <Tabs 
          value={inputType === 'file' ? 0 : 1}
          onChange={(_, newValue: number) => setInputType(newValue === 0 ? 'file' : 'url')}
          aria-label="Transcribe source"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#1994e6'
            }
          }}
        >
          <Tab 
            label={en.quickAddFile.quickAddFileOrUrl.fileTab}
            sx={{
              color: 'white',
              fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
              '&.Mui-selected': {
                color: '#1994e6'
              }
            }}
          />
          <Tab 
            label={en.quickAddFile.quickAddFileOrUrl.urlTab}
            sx={{
              color: 'white',
              fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
              '&.Mui-selected': {
                color: '#1994e6'
              }
            }}
          />
        </Tabs>
      </Box>
      
      {inputType === 'file' && (
          <Box
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            sx={{
              border: '2px dashed #1994e6',
              borderRadius: '12px',
              p: 4,
              textAlign: 'center',
              bgcolor: '#1a2832',
              mb: 3,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#1e2d38',
                borderColor: '#2da8ff'
              }
            }}
            onClick={handleBrowse}
          >
            <DriveFolderUploadIcon sx={{ fontSize: 64, color: '#1994e6', mb: 2 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
                fontWeight: 'medium',
                mb: 1
              }}
            >
              {en.quickAddFile.quickAddFileOrUrl.dragDrop}
              <Box component="span" sx={{ color: '#1994e6', textDecoration: 'underline', ml: 0.5 }}>
                {en.quickAddFile.quickAddFileOrUrl.browse}
              </Box>
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#a0aab5',
                fontFamily: '"Spline Sans", "Noto Sans", sans-serif'
              }}
            >
              {en.quickAddFile.quickAddFileOrUrl.supportedFormats}
            </Typography>
            {isSubmitting && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress 
                  sx={{ 
                    bgcolor: '#3d505c',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#1994e6'
                    }
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1, 
                    color: '#1994e6',
                    fontFamily: '"Spline Sans", "Noto Sans", sans-serif'
                  }}
                >
                  {selectedFile ? en.quickAddFile.quickAddFileOrUrl.uploading : ''}
                </Typography>
              </Box>
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
      
      {inputType === 'url' && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder={en.quickAddFile.quickAddFileOrUrl.pasteUrl}
              fullWidth
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setOpenDialog(true);
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#1a2832',
                  color: 'white',
                  borderRadius: '8px',
                  fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
                  '& fieldset': {
                    borderColor: '#3d505c',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1994e6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1994e6',
                  }
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  '&::placeholder': {
                    color: '#a0aab5',
                    opacity: 1
                  }
                }
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: '#1994e6',
                color: 'white',
                borderRadius: '8px',
                px: 3,
                fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
                fontWeight: 'medium',
                '&:hover': {
                  bgcolor: '#1580cc'
                },
                '&:disabled': {
                  bgcolor: '#3d505c',
                  color: '#a0aab5'
                }
              }}
              disabled={!urlInput.trim()}
              onClick={() => setOpenDialog(true)}
            >
              {en.quickAddFile.quickAddFileOrUrl.submit}
            </Button>
          </Box>
      )}
      <LanguageSelector language={language} setLanguage={setLanguage} />
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetState();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#243947',
            color: 'white',
            border: '1px solid #3d505c'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'white',
            fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {inputType === 'file'
            ? en.quickAddFile.quickAddFileOrUrl.modalTitleFile
            : en.quickAddFile.quickAddFileOrUrl.modalTitleUrl}
          <IconButton
            onClick={() => {
              setOpenDialog(false);
              resetState();
            }}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ color: 'white' }}>
          <Stack spacing={2}>
            {inputType === 'file' && selectedFile && (
              <Typography sx={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
                {en.quickAddFile.quickAddFileOrUrl.fileLabel} <strong>{selectedFile.name}</strong> (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
            {inputType === 'url' && (
              <Typography sx={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
                {en.quickAddFile.quickAddFileOrUrl.urlLabel} <strong>{urlInput}</strong>
              </Typography>
            )}
            <Typography sx={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
              {en.quickAddFile.quickAddFileOrUrl.selectLanguage}
            </Typography>
            <LanguageSelector language={language} setLanguage={setLanguage} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenDialog(false);
              resetState();
            }}
            sx={{
              color: 'white',
              borderColor: '#3d505c',
              fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
              '&:hover': {
                borderColor: '#1994e6',
                bgcolor: 'rgba(25, 148, 230, 0.1)'
              }
            }}
          >
            {en.quickAddFile.quickAddFileOrUrl.cancel}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              bgcolor: '#1994e6',
              color: 'white',
              fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
              '&:hover': {
                bgcolor: '#1580cc'
              },
              '&:disabled': {
                bgcolor: '#3d505c',
                color: '#a0aab5'
              }
            }}
          >
            {isSubmitting
              ? en.quickAddFile.quickAddFileOrUrl.transcribing
              : en.quickAddFile.quickAddFileOrUrl.transcribe}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default QuickAddFileOrUrl;
