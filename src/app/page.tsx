'use client';
import { Button, Container, Typography } from '@mui/material';

import TTSContainer from '@/components/TTSContainer';
export default function Home() {
  const handleClick = () => {
    console.log('Hello, world!');
    console.log(process.env.NEXT_PUBLIC_API_URL);
  };
  return (
    <Container>
      <Typography variant='h1'>Welcome to Next.js!</Typography>
      <Button variant='contained' color='primary'>
        Hello World
      </Button>
      <Button variant='contained' onClick={handleClick}>
        Click me
      </Button>
      <TTSContainer />
    </Container>
  );
}
