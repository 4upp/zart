import React from 'react';

interface NeonInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const NeonInput: React.FC<NeonInputProps> = ({ value, onChange, placeholder, disabled }) => {
  return (
    <div className="relative group w-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyber-primary to-cyber-secondary rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <textarea
        className="relative w-full h-16 p-4 bg-cyber-dark border border-cyber-slate rounded-lg text-cyber-primary font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyber-primary/50 placeholder-slate-600 transition-all shadow-xl resize-none overflow-hidden"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={false}
      />
      <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[10px] text-cyber-primary/40 pointer-events-none font-display tracking-widest">
        STREAM_READY
      </div>
    </div>
  );
};