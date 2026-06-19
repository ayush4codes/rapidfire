import './globals.css';

export const metadata = {
  title: 'Rapid Fire — Tech Quiz',
  description: '40 rapid-fire tech questions. 15 seconds each. How fast can you think?',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
