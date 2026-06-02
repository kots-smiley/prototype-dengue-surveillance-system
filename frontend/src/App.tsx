import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
