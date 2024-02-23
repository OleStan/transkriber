import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Snackbar, { SnackbarProps } from '@mui/joy/Snackbar';

type NotificationContextType = {
  showNotification: (message: string, color?: SnackbarProps['color']) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

type NotificationProviderProps = {
  children: ReactNode;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [color, setColor] = useState<SnackbarProps['color']>('neutral');

  const showNotification = useCallback(
    (newMessage: string, newColor: SnackbarProps['color'] = 'neutral') => {
      setMessage(newMessage);
      setColor(newColor);
      setOpen(true);
    },
    []
  );

  // const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
  //   if (reason === 'clickaway') {
  //     return;
  //   }
  //   setOpen(false);
  // };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        variant={'soft'}
        color={color}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        // onClose={handleClose}
      >
        {message}
      </Snackbar>
    </NotificationContext.Provider>
  );
};
