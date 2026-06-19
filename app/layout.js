import './globals.css';

export const metadata = {
  title: 'Rapid Fire — Tech Quiz',
  description: '40 rapid-fire tech questions. 10-20 seconds each. How fast can you think?',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="global-logos">
          <img src="/assets/75.png" alt="75 Logo" className="logo-left" />
          <img src="/assets/CacheBugs.png" alt="CacheBugs Logo" className="logo-right" />
        </div>
        {children}
      </body>
    </html>
  );
}
