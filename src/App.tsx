import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { StudentPortal } from './pages/StudentPortal.tsx';
import { AdminPortal } from './pages/AdminPortal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState<'landing' | 'student' | 'admin'>('landing');
  const [selectedService, setSelectedService] = useState<string>('transport');

  // Sync view when user auth changes
  React.useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setActiveView('admin');
      } else {
        setActiveView('student');
      }
    } else {
      setActiveView('landing');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xl mb-4">
          O
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
          <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
          <span>Initializing ORBINEX Campus Portal...</span>
        </div>
      </div>
    );
  }

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (role: 'ADMIN' | 'STUDENT') => {
    if (role === 'ADMIN') {
      setActiveView('admin');
    } else {
      setActiveView('student');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* Show standard header only on landing or student view */}
      {activeView !== 'admin' && (
        <Header
          onOpenAuth={handleOpenAuth}
          currentView={activeView}
          onNavigate={(view) => setActiveView(view as any)}
        />
      )}

      {/* Main View Switching */}
      <div className="flex-1 flex flex-col">
        {activeView === 'landing' && (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onSelectService={(serviceKey) => {
              setSelectedService(serviceKey);
              if (user) {
                setActiveView('student');
              } else {
                handleOpenAuth('login');
              }
            }}
          />
        )}

        {activeView === 'student' && user && (
          <StudentPortal
            initialTab={selectedService || 'dashboard'}
            onLogout={logout}
          />
        )}

        {activeView === 'admin' && user && user.role === 'ADMIN' && (
          <AdminPortal onLogout={logout} />
        )}

        {/* Protection: If student attempts to view admin view without permission */}
        {activeView === 'admin' && user && user.role !== 'ADMIN' && (
          <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50">
            <div className="p-8 max-w-md bg-white border border-neutral-200 rounded-xl text-center shadow-xs">
              <h3 className="text-lg font-bold text-neutral-900">Access Restricted</h3>
              <p className="text-xs text-neutral-500 mt-2">
                You do not have permission to access the administrator portal.
              </p>
              <button
                onClick={() => setActiveView('student')}
                className="mt-4 px-4 py-2 bg-orange-600 text-white font-semibold text-xs rounded-lg"
              >
                Return to Student Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {activeView !== 'admin' && <Footer />}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
