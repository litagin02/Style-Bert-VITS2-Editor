'use client';
import { Container } from '@mui/material';

import AlertPopup from '@/components/AlertPopup';
import EditorContainer from '@/components/EditorContainer';
import PopupProvider from '@/contexts/PopupProvider';

export default function Home() {
  return (
    <Container maxWidth='xl'>
      <PopupProvider>
        <AlertPopup />
        <EditorContainer />
      </PopupProvider>
    </Container>
  );
}
