'use client';
import { Container } from '@mui/material';
import Link from 'next/link';

import AlertDialog from '@/components/AlertDialog';
import TTSContainer from '@/components/TTSContainer';
import DialogProvider from '@/contexts/dialogContext';

export default function Home() {
  return (
    <Container>
      <DialogProvider>
        <AlertDialog />
        <TTSContainer />
      </DialogProvider>
      <Link href='/dict'> Go to Dict</Link>
    </Container>
  );
}
