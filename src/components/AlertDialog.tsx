import { Alert, Snackbar } from '@mui/material';
import React from 'react';

import { useDialog } from '@/contexts/dialogContext';

const AlertDialog = () => {
  const { isOpen, closeDialog, message, severity } = useDialog();

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

export default AlertDialog;
