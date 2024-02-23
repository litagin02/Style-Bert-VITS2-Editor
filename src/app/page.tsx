'use client';
import { Container } from '@mui/material';

import AlertPopup from '@/components/AlertDialog';
import EditorContainer from '@/components/EditorContainer';
import PopupProvvider from '@/contexts/dialogContext';

export default function Home() {
  return (
    <Container maxWidth='xl'>
      <PopupProvvider>
        <AlertPopup />
        <EditorContainer />
      </PopupProvvider>
    </Container>
  );
}
