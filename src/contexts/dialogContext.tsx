import type { AlertColor } from '@mui/material';
import React, { createContext, useState } from 'react';

interface DialogContextType {
  isOpen: boolean;
  message: string;
  severity?: AlertColor;
  openDialog: (message: string) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType>({
  isOpen: false,
  message: '',
  severity: 'error',
  openDialog: () => {},
  closeDialog: () => {},
});

interface DialogProviderProps {
  children: React.ReactNode;
}

export default function DialogProvider({ children }: DialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('error');

  const openDialog = (message: string, severity?: AlertColor) => {
    setIsOpen(true);
    setMessage(message);
    if (severity) {
      setSeverity(severity);
    } else {
      setSeverity('error');
    }
  };
  const closeDialog = () => {
    setIsOpen(false);
    setMessage('');
    setSeverity('error');
  };

  return (
    <DialogContext.Provider
      value={{ isOpen, message, openDialog, closeDialog, severity }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export const useDialog = () => React.useContext(DialogContext);
