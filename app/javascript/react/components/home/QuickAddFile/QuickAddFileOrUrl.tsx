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
import Tab, { tabClasses } from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';
import LinearProgress from '@mui/joy/LinearProgress';

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
    <Sheet variant="outlined" sx={{ p: 4, borderRadius: 8, mb: 2 }}>
      <Tabs
        variant="outlined"
        aria-label="Transcribe source"
        value={inputType === 'file' ? 0 : 1}
        onChange={(_, v) => setInputType(v === 0 ? 'file' : 'url')}
        defaultValue={0}
        sx={{ width: '100%', borderRadius: 'lg', boxShadow: 'sm', overflow: 'auto', mb: 2 }}
      >
        <TabList
          disableUnderline
          tabFlex={1}
          sx={{
            [`& .${tabClasses.root}`]: {
              fontSize: 'sm',
              fontWeight: 'lg',
              [`&[aria-selected="true"]`]: {
                color: 'primary.500',
                bgcolor: 'background.surface',
              },
              [`&.${tabClasses.focusVisible}`]: {
                outlineOffset: '-4px',
              },
            },
          }}
        >
          <Tab disableIndicator variant="soft" sx={{ flexGrow: 1 }}>
            {en.quickAddFile.quickAddFileOrUrl.fileTab}
          </Tab>
          <Tab disableIndicator variant="soft" sx={{ flexGrow: 1 }}>
            {en.quickAddFile.quickAddFileOrUrl.urlTab}
          </Tab>
        </TabList>
        <TabPanel value={0}>
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
              {en.quickAddFile.quickAddFileOrUrl.dragDrop}
              <span style={{ color: '#1976d2', textDecoration: 'underline' }}>
                {en.quickAddFile.quickAddFileOrUrl.browse}
              </span>.
            </Typography>
            <Typography level="body-sm" sx={{ mt: 1, color: '#888' }}>
              {en.quickAddFile.quickAddFileOrUrl.supportedFormats}
            </Typography>
            {isSubmitting && <LinearProgress sx={{ mt: 2 }} />}
            {isSubmitting && (
              <Typography level="body-sm" sx={{ mt: 1 }}>
                {selectedFile ? en.quickAddFile.quickAddFileOrUrl.uploading : ''}
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
        </TabPanel>
        <TabPanel value={1}>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Input
              placeholder={en.quickAddFile.quickAddFileOrUrl.pasteUrl}
              fullWidth
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              sx={{ mb: 2, flex: 1 }}
              onKeyDown={(e) => {
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
              {en.quickAddFile.quickAddFileOrUrl.submit}
            </Button>
          </Box>
        </TabPanel>
      </Tabs>
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
          <DialogTitle>
            {inputType === 'file'
              ? en.quickAddFile.quickAddFileOrUrl.modalTitleFile
              : en.quickAddFile.quickAddFileOrUrl.modalTitleUrl}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {inputType === 'file' && selectedFile && (
                <Typography>
                  {en.quickAddFile.quickAddFileOrUrl.fileLabel} <strong>{selectedFile.name}</strong> (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
              {inputType === 'url' && (
                <Typography>
                  {en.quickAddFile.quickAddFileOrUrl.urlLabel} <strong>{urlInput}</strong>
                </Typography>
              )}
              <Typography>
                {en.quickAddFile.quickAddFileOrUrl.selectLanguage}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setOpenDialog(false);
                    resetState();
                  }}
                >
                  {en.quickAddFile.quickAddFileOrUrl.cancel}
                </Button>
                <Button
                  variant='solid'
                  color='primary'
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? en.quickAddFile.quickAddFileOrUrl.transcribing
                    : en.quickAddFile.quickAddFileOrUrl.transcribe}
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
