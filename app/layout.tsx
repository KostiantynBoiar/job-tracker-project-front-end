import type { Metadata } from 'next';
import './globals.css';
import '../src/styles/variables.css';
import LayoutWrapper from '../src/components/common/Layout/LayoutWrapper';
import { AuthProvider } from '../src/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'FAANG Vacancy Tracker',
  description: 'Automated job tracking for developers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}