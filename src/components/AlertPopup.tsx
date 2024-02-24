import { Alert, Snackbar } from '@mui/material';
import React from 'react';

import { usePopup } from '@/contexts/PopupProvider';

const AlertPopup = () => {
  const { isOpen, closePopup, message, severity } = usePopup();

  return (
    <Snackbar
      open={isOpen}
      // autoHideDuration={6000}
      onClose={closePopup}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={closePopup}
        severity={severity}
        sx={{ width: '100%' }}
        elevation={6}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertPopup;
