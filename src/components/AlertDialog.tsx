import { Alert, Snackbar } from '@mui/material';
import React from 'react';

import { usePopup } from '@/contexts/dialogContext';

const AlertPopup = () => {
  const { isOpen, closePopup: closeDialog, message, severity } = usePopup();

  return (
    <Snackbar
      open={isOpen}
      // autoHideDuration={6000}
      onClose={closeDialog}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={closeDialog}
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
