import './globals.css';

export const metadata = {
  title: 'Rapid Fire — Tech Quiz',
  description: '40 rapid-fire tech questions. 10-20 seconds each. How fast can you think?',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="global-logos">
          <img src="/assets/CacheBugs.png" alt="CacheBugs Logo" className="logo-right" />
        </div>
        {children}
      </body>
    </html>
  );
}
