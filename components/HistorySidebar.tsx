
import React from 'react';
import { HistoryItem } from '../types';
import { Clock, ChevronRight, Trash2 } from 'lucide-react';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onDelete, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-80 bg-white h-full shadow-2xl overflow-y-auto p-6 border-l border-slate-200 animate-slide-in-right">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" /> History
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {history.length === 0 ? (
          <div className="text-center text-slate-400 mt-10">
            <p className="text-sm">No analysis history found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className="group cursor-pointer bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg p-3 transition-all relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 text-sm truncate pr-2">{item.title || "Untitled Analysis"}</h4>
                    <p className="text-xs text-slate-500 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${
                    item.score >= 75 ? 'bg-green-100 text-green-700' :
                    item.score >= 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.score}%
                  </div>
                </div>
                 <button 
                    onClick={(e) => onDelete(item.id, e)}
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;
