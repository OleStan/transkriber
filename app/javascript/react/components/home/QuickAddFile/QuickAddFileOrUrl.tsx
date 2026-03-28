import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import LanguageSelector from './LanguageSelector';
import { useNotification } from '../../../contexts/NotificationContext';
import { useAppNavigate } from '../../../helpers/navigationHelpers';
import { useCreateTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import en from '../../../locales/en';
import { DS } from '../../../theme';

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

  useEffect(() => {
    const stored = localStorage.getItem('selectedLanguage');
    if (stored) setLanguage(stored);
  }, []);

  return (
    <Box
      sx={{
        bgcolor: DS.surfaceLow,
        borderRadius: '12px',
        p: 3,
        mb: 2,
        border: `1px solid ${DS.outlineVariant}1a`,
      }}
    >
      {/* Tabs */}
      <Box sx={{ mb: 3, borderBottom: `1px solid ${DS.outlineVariant}30` }}>
        <Tabs
          value={inputType === 'file' ? 0 : 1}
          onChange={(_, newValue: number) => setInputType(newValue === 0 ? 'file' : 'url')}
          aria-label="Transcribe source"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: DS.primary,
            },
          }}
        >
          <Tab
            label={en.quickAddFile.quickAddFileOrUrl.fileTab}
            sx={{
              color: '#94a3b8',
              fontFamily: '"Inter", sans-serif',
              fontSize: '13px',
              '&.Mui-selected': { color: DS.primary },
            }}
          />
          <Tab
            label={en.quickAddFile.quickAddFileOrUrl.urlTab}
            sx={{
              color: '#94a3b8',
              fontFamily: '"Inter", sans-serif',
              fontSize: '13px',
              '&.Mui-selected': { color: DS.primary },
            }}
          />
        </Tabs>
      </Box>

      {/* File Drop Zone */}
      {inputType === 'file' && (
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleBrowse}
          sx={{
            border: `2px dashed ${DS.outlineVariant}`,
            borderRadius: '12px',
            p: 4,
            textAlign: 'center',
            bgcolor: DS.surfaceLowest,
            mb: 3,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: DS.primary,
              bgcolor: `${DS.primary}08`,
            },
          }}
        >
          <DriveFolderUploadIcon sx={{ fontSize: 48, color: DS.primary, mb: 1.5 }} />
          <Typography
            sx={{
              color: DS.onSurface,
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              fontSize: '15px',
              mb: 0.5,
            }}
          >
            {en.quickAddFile.quickAddFileOrUrl.dragDrop}
            <Box component="span" sx={{ color: DS.primary, textDecoration: 'underline', ml: 0.5 }}>
              {en.quickAddFile.quickAddFileOrUrl.browse}
            </Box>
          </Typography>
          <Typography
            sx={{
              color: DS.outline,
              fontFamily: '"Inter", sans-serif',
              fontSize: '12px',
            }}
          >
            {en.quickAddFile.quickAddFileOrUrl.supportedFormats}
          </Typography>
          {isSubmitting && (
            <Box sx={{ mt: 3 }}>
              <LinearProgress
                sx={{
                  bgcolor: DS.surfaceHigh,
                  '& .MuiLinearProgress-bar': {
                    background: DS.primaryGradient,
                  },
                }}
              />
              <Typography sx={{ mt: 1, color: DS.primary, fontFamily: '"Inter", sans-serif', fontSize: '12px' }}>
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

      {/* URL Input */}
      {inputType === 'url' && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder={en.quickAddFile.quickAddFileOrUrl.pasteUrl}
              fullWidth
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setOpenDialog(true);
              }}
              variant="standard"
              sx={{
                '& .MuiInput-root': {
                  bgcolor: DS.surfaceLowest,
                  color: DS.onSurface,
                  fontFamily: '"Newsreader", serif',
                  fontSize: '1.125rem',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '12px 12px 0 0',
                  '&::before': { display: 'none' },
                  '&::after': { borderBottomColor: DS.primary },
                  borderBottom: `2px solid ${DS.outlineVariant}50`,
                  '&.Mui-focused': {
                    borderBottomColor: DS.primary,
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: `${DS.outline}80`,
                  opacity: 1,
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                background: DS.primaryGradient,
                color: DS.onPrimary,
                borderRadius: '12px',
                px: 3,
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 700,
                flexShrink: 0,
                '&:hover': {
                  background: DS.primaryGradient,
                  opacity: 0.9,
                },
                '&:disabled': {
                  bgcolor: DS.surfaceHigh,
                  color: DS.outline,
                  background: 'none',
                },
              }}
              disabled={!urlInput.trim()}
              onClick={() => setOpenDialog(true)}
            >
              {en.quickAddFile.quickAddFileOrUrl.submit}
            </Button>
          </Box>
          {/* Feature chips */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            {['Video Hubs', 'Podcasts', 'Direct Links'].map((chip) => (
              <Box
                key={chip}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '9999px',
                  bgcolor: `${DS.surfaceHighest}33`,
                  border: `1px solid ${DS.outlineVariant}30`,
                  color: DS.onSurfaceVariant,
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                {chip}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* AI Speaker bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          borderRadius: '8px',
          bgcolor: 'rgba(202, 128, 30, 0.05)',
          mb: 2,
        }}
      >
        <AutoAwesomeIcon sx={{ color: DS.tertiary, fontSize: 16 }} />
        <Typography sx={{ color: DS.tertiary, fontFamily: '"Inter", sans-serif', fontSize: '12px', fontWeight: 500 }}>
          AI-powered speaker detection and language auto-detection included
        </Typography>
      </Box>

      <LanguageSelector language={language} setLanguage={setLanguage} />

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => { setOpenDialog(false); resetState(); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: DS.surfaceHigh,
            border: `1px solid ${DS.outlineVariant}33`,
            borderRadius: '12px',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: DS.onSurface,
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {inputType === 'file'
            ? en.quickAddFile.quickAddFileOrUrl.modalTitleFile
            : en.quickAddFile.quickAddFileOrUrl.modalTitleUrl}
          <IconButton onClick={() => { setOpenDialog(false); resetState(); }} sx={{ color: DS.outline }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ color: DS.onSurface }}>
          <Stack spacing={2}>
            {inputType === 'file' && selectedFile && (
              <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '14px' }}>
                {en.quickAddFile.quickAddFileOrUrl.fileLabel}{' '}
                <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
            {inputType === 'url' && (
              <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '14px' }}>
                {en.quickAddFile.quickAddFileOrUrl.urlLabel} <strong>{urlInput}</strong>
              </Typography>
            )}
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', color: DS.onSurfaceVariant }}>
              {en.quickAddFile.quickAddFileOrUrl.selectLanguage}
            </Typography>
            <LanguageSelector language={language} setLanguage={setLanguage} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => { setOpenDialog(false); resetState(); }}
            sx={{
              color: DS.primary,
              borderColor: `${DS.outlineVariant}50`,
              fontFamily: '"Inter", sans-serif',
              '&:hover': { borderColor: DS.primary, bgcolor: `${DS.primary}10` },
            }}
          >
            {en.quickAddFile.quickAddFileOrUrl.cancel}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              background: DS.primaryGradient,
              color: DS.onPrimary,
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 700,
              '&:hover': { background: DS.primaryGradient, opacity: 0.9 },
              '&:disabled': { bgcolor: DS.surfaceHigh, color: DS.outline, background: 'none' },
            }}
          >
            {isSubmitting
              ? en.quickAddFile.quickAddFileOrUrl.transcribing
              : en.quickAddFile.quickAddFileOrUrl.transcribe}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickAddFileOrUrl;
