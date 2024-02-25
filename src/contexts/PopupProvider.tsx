import type { AlertColor } from '@mui/material';
import React, { createContext, useCallback, useState } from 'react';

interface PopupContextType {
  isOpen: boolean;
  message: string;
  severity: AlertColor;
  duration: number | null;
  openPopup: (message: string, severity: AlertColor, duration?: number) => void;
  closePopup: () => void;
}

const PopupContext = createContext<PopupContextType>({
  isOpen: false,
  message: '',
  severity: 'error',
  duration: null,
  openPopup: () => {},
  closePopup: () => {},
});

interface DialogProviderProps {
  children: React.ReactNode;
}

export default function PopupProvider({ children }: DialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('error');
  const [duration, setDuration] = useState<number | null>(null);

  const openPopup = useCallback(
    (message: string, severity?: AlertColor, duration?: number) => {
      setIsOpen(true);
      setMessage(message);
      if (severity) {
        setSeverity(severity);
      } else {
        setSeverity('error');
      }
      if (duration) {
        setDuration(duration);
      }
    },
    [],
  );

  const closePopup = useCallback(() => {
    setIsOpen(false);
    setMessage('');
    setSeverity('error');
  }, []);

  return (
    <PopupContext.Provider
      value={{
        isOpen,
        message,
        openPopup,
        closePopup,
        severity,
        duration,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
}

export const usePopup = () => React.useContext(PopupContext);
