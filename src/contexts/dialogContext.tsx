import type { AlertColor } from '@mui/material';
import React, { createContext, useState } from 'react';

interface PopupContextType {
  isOpen: boolean;
  message: string;
  severity?: AlertColor;
  openPopup: (message: string, severity?: AlertColor) => void;
  closePopup: () => void;
}

const PopupContext = createContext<PopupContextType>({
  isOpen: false,
  message: '',
  severity: 'error',
  openPopup: () => {},
  closePopup: () => {},
});

interface DialogProviderProps {
  children: React.ReactNode;
}

export default function PopupProvvider({ children }: DialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('error');

  const openPopup = (message: string, severity?: AlertColor) => {
    setIsOpen(true);
    setMessage(message);
    if (severity) {
      setSeverity(severity);
    } else {
      setSeverity('error');
    }
  };
  const closePopup = () => {
    setIsOpen(false);
    setMessage('');
    setSeverity('error');
  };

  return (
    <PopupContext.Provider
      value={{
        isOpen,
        message,
        openPopup,
        closePopup,
        severity,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
}

export const usePopup = () => React.useContext(PopupContext);
