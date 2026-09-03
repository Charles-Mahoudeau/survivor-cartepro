import localFont from 'next/font/local';

export const marianne = localFont({
  src: [
    {
      path: '../app/fonts/marianne/Marianne-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../app/fonts/marianne/Marianne-Regular_Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../app/fonts/marianne/Marianne-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../app/fonts/marianne/Marianne-Medium_Italic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../app/fonts/marianne/Marianne-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../app/fonts/marianne/Marianne-Bold_Italic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../app/fonts/marianne/Marianne-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../app/fonts/marianne/Marianne-ExtraBold_Italic.woff2',
      weight: '800',
      style: 'italic',
    },
  ],
  variable: '--font-marianne',
  display: 'swap',
});

export const spectral = localFont({
  src: [
    {
      path: '../app/fonts/spectral/Spectral-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../app/fonts/spectral/Spectral-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../app/fonts/spectral/Spectral-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../app/fonts/spectral/Spectral-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../app/fonts/spectral/Spectral-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../app/fonts/spectral/Spectral-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../app/fonts/spectral/Spectral-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../app/fonts/spectral/Spectral-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-spectral',
  display: 'swap',
});
