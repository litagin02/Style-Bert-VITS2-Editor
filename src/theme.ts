'use client';
import { createTheme } from '@mui/material/styles';
import { Noto_Sans_JP } from 'next/font/google';

// const roboto = Roboto({
//   weight: ['300', '400', '500', '700'],
//   subsets: ['latin'],
//   display: 'swap',
// });

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
});

const theme = createTheme({
  typography: {
    fontFamily: notoSansJP.style.fontFamily,
  },
});

export default theme;
