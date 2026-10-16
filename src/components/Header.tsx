import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Shield, User as UserIcon, LogOut, ArrowRight, Car, PhoneCall } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, currentView = 'landing', onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate?.(user?.role === 'ADMIN' ? 'admin' : user ? 'student' : 'landing')}
          >
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              O
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-orange-600 transition-colors">
                  ORBINEX
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-700 rounded border border-neutral-200">
                  MBCCET
                </span>
              </div>
              <span className="text-[11px] font-medium text-neutral-500 tracking-wide">
                Powered by AMT
              </span>
            </div>
          </div>

          {/* Navigation / Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'ADMIN' ? (
                  <button
                    onClick={() => onNavigate?.('admin')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      currentView === 'admin'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-orange-600" />
                    Admin Portal
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate?.('student')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      currentView === 'student'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5 text-orange-600" />
                    Student Portal
                  </button>
                )}

                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-medium text-neutral-900">{user.name}</span>
                  <span className="text-[10px] text-neutral-500">
                    {user.role === 'ADMIN' ? 'Administrator' : user.college_id}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  Student Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-sm transition-colors"
                >
                  Admin Access
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
