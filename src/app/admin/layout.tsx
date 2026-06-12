import '../globals.css';
import AuthProvider from '@/components/AuthProvider';

export const metadata = {
  title: 'Admin Panel | Technical Vibe',
  description: 'Manage your Technical Vibe website content',
};

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
