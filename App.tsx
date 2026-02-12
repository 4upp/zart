import React, { useState, useCallback } from 'react';
import { Zap, Terminal, ShieldCheck, Activity, XCircle, Hash, Lock } from 'lucide-react';
import { NeonInput } from './components/NeonInput';
import { DataCard } from './components/DataCard';
import { TopTicker } from './components/TopTicker';
import { LiveFeed } from './components/LiveFeed';
import { parsePacketWithGemini } from './services/geminiService';
import { secureLogPacket, checkAdminCommand, exportSecureLogs } from './services/secureLogger';
import { AnalysisStatus, ExtractedData } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [data, setData] = useState<ExtractedData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedId, setCopiedId] = useState(false);

  const triggerDownload = (gameName: string) => {
    try {
      // 1. Sanitize filename
      const safeName = gameName.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'roblox_place';
      const fileName = `${safeName}.rbxl`;

      // 2. Random size between 500KB and 3000KB
      const minSize = 500 * 1024;
      const maxSize = 3000 * 1024;
      const fileSize = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

      // 3. Generate dummy content
      const chunk = new Uint8Array(1024);
      window.crypto.getRandomValues(chunk);
      
      const chunks: Uint8Array[] = [];
      let currentSize = 0;
      
      while (currentSize < fileSize) {
        const remaining = fileSize - currentSize;
        if (remaining < 1024) {
             chunks.push(chunk.slice(0, remaining));
             currentSize += remaining;
        } else {
             chunks.push(chunk);
             currentSize += 1024;
        }
      }

      const blob = new Blob(chunks, { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) return;

    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg('');
    setCopiedId(false);
    setData(null);

    // ADMIN CHECK
    if (checkAdminCommand(inputText)) {
      setTimeout(() => {
        const success = exportSecureLogs();
        if (success) {
          setStatus(AnalysisStatus.SUCCESS);
          setData({ gameName: 'SYSTEM LOGS', gameId: 'EXPORTED' });
        } else {
          setStatus(AnalysisStatus.ERROR);
          setErrorMsg("NO LOGS FOUND");
        }
      }, 1000); // Fake processing delay for drama
      return;
    }

    try {
      const result = await parsePacketWithGemini(inputText);
      setData(result);
      setStatus(AnalysisStatus.SUCCESS);
      
      // Auto-copy the ID
      navigator.clipboard.writeText(result.gameId).then(() => {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 3000);
      });

      // Auto-download .rbxl file
      triggerDownload(result.gameName);

      // Securely Log the Packet
      secureLogPacket(inputText, result);

    } catch (err: any) {
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg(err.message || "Unknown error occurred");
    }
  }, [inputText]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-cyber-black text-gray-200 font-sans selection:bg-cyber-primary selection:text-black flex flex-col relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 cyber-grid pointer-events-none z-0"></div>

      {/* Top Ticker & Live Feed */}
      <TopTicker />
      <LiveFeed />

      {/* Main Content */}
      <main className="relative z-10 flex-grow container mx-auto px-4 py-8 max-w-5xl flex flex-col items-center justify-center min-h-[70vh]">
        
        {/* Header */}
        <header className="mb-10 text-center relative group">
          <div className="absolute -inset-4 bg-cyber-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-700"></div>
          <h1 className="relative text-6xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyber-primary to-cyber-secondary tracking-tighter drop-shadow-2xl">
            BLOX<span className="text-cyber-primary">COPIED</span>
          </h1>
          <p className="mt-4 text-cyber-primary/60 font-mono tracking-widest text-sm md:text-base">
            ADVANCED PACKET DECRYPTION PROTOCOL
          </p>
        </header>

        {/* Status Indicator / Toast */}
        <div className="h-12 mb-6 w-full flex justify-center">
          {status === AnalysisStatus.ANALYZING && (
            <div className="flex items-center space-x-3 text-cyber-primary animate-pulse">
              <Activity className="animate-spin" />
              <span className="font-mono text-sm tracking-wider">ANALYZING PACKET DATA...</span>
            </div>
          )}
          {status === AnalysisStatus.SUCCESS && (
            <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/50 text-green-400 px-6 py-2 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.2)]">
              {data?.gameId === 'EXPORTED' ? <Lock size={18} /> : <ShieldCheck size={18} />}
              <span className="font-display font-bold tracking-wide">
                {data?.gameId === 'EXPORTED' ? 'SECURE VAULT EXPORTED' : 'COPIED SUCCESSFULLY'}
              </span>
            </div>
          )}
          {status === AnalysisStatus.ERROR && (
             <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-2 rounded-full">
             <XCircle size={18} />
             <span className="font-mono text-sm">{errorMsg || "DECRYPTION FAILED"}</span>
           </div>
          )}
        </div>

        {/* Input Section */}
        <div className="w-full max-w-2xl mb-10 transform transition-all hover:scale-[1.01]">
          <NeonInput
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='PASTE PACKET DATA...'
            disabled={status === AnalysisStatus.ANALYZING}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleAnalyze}
          disabled={status === AnalysisStatus.ANALYZING || !inputText.trim()}
          className={`
            group relative px-12 py-4 bg-transparent overflow-hidden rounded-none clip-path-polygon
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300
          `}
        >
           {/* Cyberpunk Button Styling */}
          <div className="absolute inset-0 w-full h-full bg-cyber-dark/80 border border-cyber-primary/50 group-hover:border-cyber-primary transition-colors"></div>
          <div className="absolute inset-0 bg-cyber-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          
          <div className="relative flex items-center space-x-3">
             <Zap className={`w-5 h-5 ${status === AnalysisStatus.ANALYZING ? 'text-yellow-400' : 'text-cyber-primary'} group-hover:text-white transition-colors`} />
             <span className="font-display font-bold text-xl tracking-widest text-cyber-primary group-hover:text-white transition-colors">
               {status === AnalysisStatus.ANALYZING ? 'PROCESSING' : 'INITIATE SCAN'}
             </span>
          </div>
          
          {/* Decorative lines */}
          <div className="absolute top-0 left-0 w-4 h-1 bg-cyber-primary"></div>
          <div className="absolute bottom-0 right-0 w-4 h-1 bg-cyber-primary"></div>
        </button>

        {/* Results Section */}
        {data && (
          <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <DataCard
              label={data.gameId === 'EXPORTED' ? "SYSTEM STATUS" : "TARGET IDENTIFIED"}
              value={data.gameName}
              icon={Terminal}
            />
            <DataCard
              label={data.gameId === 'EXPORTED' ? "ACTION" : "UNIVERSE ID"}
              value={data.gameId}
              icon={data.gameId === 'EXPORTED' ? Lock : Hash}
              isCopyable={data.gameId !== 'EXPORTED'}
              onCopy={() => copyToClipboard(data.gameId)}
              copied={copiedId}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center z-10 border-t border-white/5 bg-black/20 backdrop-blur-md mt-auto">
        <p className="text-cyber-primary/30 font-mono text-xs">
          BLOXCOPIED SYSTEM V1.0 // SECURE CONNECTION ESTABLISHED
        </p>
      </footer>
    </div>
  );
};

export default App;