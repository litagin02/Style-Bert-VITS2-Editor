import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

interface SimpleBackdropProps {
  open: boolean;
}

export default function SimpleBackdrop({ open }: SimpleBackdropProps) {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <CircularProgress color='inherit' />
    </Backdrop>
  );
}
