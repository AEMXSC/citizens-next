import type { Metadata } from 'next';
import Script from 'next/script';
import { getAemConfig } from '@/lib/aem-config';
import './globals.css';

// The Universal Editor connection is injected here, in the root layout, so it
// applies to every route. Two pieces, matching the proven NYL wiring:
//   1. <meta name="urn:adobe:aue:system:aemconnection" content="aem:<author>">
//   2. the UE cors.js script.
// Both are emitted only when UE_ENABLED=true, so the public deploy ships a
// clean <head> with no editor coupling.

export async function generateMetadata(): Promise<Metadata> {
  const { ueEnabled, author } = getAemConfig();
  const other: Record<string, string> = {};
  if (ueEnabled && author) {
    other['urn:adobe:aue:system:aemconnection'] = `aem:${author}`;
  }
  return {
    title: 'Citizens Mobile Banking',
    description:
      'A headless online banking app: accounts, offers, articles, and disclosures '
      + 'powered by AEM Content Fragments and editable in Universal Editor.',
    other,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ueEnabled, author, fontKit } = getAemConfig();
  const ueActive = ueEnabled && Boolean(author);

  return (
    <html lang="en">
      <head>
        {fontKit ? (
          <link rel="stylesheet" href={`https://use.typekit.net/${fontKit}.css`} />
        ) : null}
      </head>
      <body>
        {children}
        {ueActive ? (
          <Script
            src="https://universal-editor-service.adobe.io/cors.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
