
import React from 'react';
import { FileText, CheckCircle, History } from 'lucide-react';

interface HeaderProps {
  onOpenHistory?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenHistory }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">CV-Architect AI</h1>
            <p className="text-xs text-slate-500 font-medium">HR-GRADE ANALYZER</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-slate-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>ATS Compliant</span>
          </div>
          {onOpenHistory && (
            <button 
              onClick={onOpenHistory}
              className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-slate-50"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
