import './globals.css';

export const metadata = {
  title: 'BORD - Build Once, Run Daily',
  description: 'Self-hosted AI automation platform'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
