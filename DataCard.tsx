import React from 'react';
import { Copy, Gamepad2, Hash, CheckCircle } from 'lucide-react';

interface DataCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  isCopyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}

export const DataCard: React.FC<DataCardProps> = ({ label, value, icon: Icon, isCopyable, onCopy, copied }) => {
  return (
    <div className="relative group bg-cyber-slate/30 border border-cyber-primary/20 hover:border-cyber-primary/60 rounded-xl p-6 transition-all duration-300 backdrop-blur-sm overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-primary opacity-50"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-primary opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyber-primary opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-primary opacity-50"></div>

      <div className="flex items-center space-x-4 mb-3">
        <div className="p-2 rounded-lg bg-cyber-primary/10 text-cyber-primary">
          <Icon size={20} />
        </div>
        <h3 className="text-sm font-display tracking-wider text-slate-400 uppercase">{label}</h3>
      </div>

      <div className="flex items-center justify-between">
        <div className="font-mono text-xl md:text-2xl text-white font-bold truncate pr-4">
          {value}
        </div>
        {isCopyable && (
          <button
            onClick={onCopy}
            className="p-2 rounded-full hover:bg-cyber-primary/20 text-cyber-primary transition-colors focus:outline-none"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle size={20} className="text-green-400" /> : <Copy size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};