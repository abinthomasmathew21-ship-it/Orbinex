import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold text-neutral-900 tracking-tight">ORBINEX</span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs font-semibold text-neutral-600">Powered by AMT</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Campus Mobility & Student Support — MBCCET Peermade
            </p>
          </div>
          <div className="text-xs text-neutral-500">
            © 2026 ORBINEX. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
