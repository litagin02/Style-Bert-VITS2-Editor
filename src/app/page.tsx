import { Button, Container, Typography } from '@mui/material';

export default function Home() {
  return (
    <Container>
      <Typography variant='h1'>Welcome to Next.js!</Typography>
      <Button variant='contained' color='primary'>
        Hello World
      </Button>
    </Container>
  );
}
