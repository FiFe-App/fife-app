import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FDEEA2"/>
        <meta name="title" content="fife alkalmazás" />
        <meta name="description" content="A biztonságos online tér" />

        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://metatags.io/"/>
        <meta property="og:title" content="fife alkalmazás"/>
        <meta property="og:description" content="A biztonságos online tér"/>
        <meta property="og:image" content="https://fifeapp.hu/static/media/logo.d2acffec.png"/>

        <meta property="twitter:card" content="summary_large_image"/>
        <meta property="twitter:url" content="https://metatags.io/"/>
        <meta property="twitter:title" content="fife alkalmazás"/>
        <meta property="twitter:description" content="A biztonságos online tér"/>
        <meta property="twitter:image" content="https://fifeapp.hu/static/media/logo.d2acffec.png"/>

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}
