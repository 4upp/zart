import React, { useState, useEffect, useRef } from 'react';
import { User, Check } from 'lucide-react';

interface TickerItem {
  id: string;
  name: string;
  timestamp: number;
}

export const TopTicker: React.FC = () => {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const usedNames = useRef<Set<string>>(new Set());

  const generateRandomUser = () => {
    const prefixes = ["xX", "The", "Real", "Super", "Cyber", "Dark", "Pro", "Blox", "Shadow", "Neon", "Hyper", "Ultra", "Mega", "Epic", "Void", "Pixel"];
    const roots = ["Gamer", "Ninja", "Warrior", "Dev", "Master", "Legend", "Player", "Copier", "Hunter", "Slayer", "Ghost", "Viper", "Phantom", "Striker", "Glitch", "Byte"];
    const suffixes = ["_HD", "123", "99", "2077", "X", "YT", "RBX", "55", "007", "88", "_Official", "3000", "XoX"];
    
    let newUser = "";
    let attempts = 0;
    
    // Try up to 20 times to find a unique name
    do {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const root = roots[Math.floor(Math.random() * roots.length)];
      const suffix = Math.random() > 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : Math.floor(Math.random() * 9999).toString();
      newUser = `${prefix}${root}${suffix}`;
      attempts++;
    } while (usedNames.current.has(newUser) && attempts < 20);
    
    // Manage set size
    if (usedNames.current.size > 100) {
        const iterator = usedNames.current.values();
        const first = iterator.next().value;
        if (first) usedNames.current.delete(first);
    }
    
    usedNames.current.add(newUser);
    return newUser;
  };

  useEffect(() => {
    // Update current time every second to refresh "X sec ago" labels
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const now = Date.now();
    // Helper to calculate past timestamp
    const subSec = (s: number) => now - s * 1000;
    const subMin = (m: number) => now - m * 60 * 1000;

    // Initial items: Newest on Left (index 0) to Oldest on Right
    // Requested times: 44 sec ago ... 10 min ago
    const initialConfig = [
      { ts: subSec(44) },
      { ts: subMin(1) },
      { ts: subMin(2) },
      { ts: subMin(4) },
      { ts: subMin(5) },
      { ts: subMin(7) },
      { ts: subMin(10) },
    ];

    const initialItems = initialConfig.map((cfg, index) => ({
      id: `init-${index}`,
      name: generateRandomUser(),
      timestamp: cfg.ts
    }));
    
    setItems(initialItems);

    // Loop for adding new items randomly between 3-10 seconds
    let timeoutId: any;
    const scheduleNextItem = () => {
      // Random delay between 3000ms (3s) and 10000ms (10s)
      const delay = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;
      
      timeoutId = setTimeout(() => {
        const newItem = {
          id: `new-${Date.now()}`,
          name: generateRandomUser(),
          timestamp: Date.now()
        };
        
        // Add new item to start (Left)
        setItems(prev => [newItem, ...prev].slice(0, 20));
        
        scheduleNextItem();
      }, delay);
    };

    scheduleNextItem();

    return () => clearTimeout(timeoutId);
  }, []);

  const getTimeLabel = (timestamp: number) => {
    const diff = Math.max(0, Math.floor((currentTime - timestamp) / 1000));
    if (diff < 60) return `${diff} sec ago`;
    const mins = Math.floor(diff / 60);
    return `${mins} min ago`;
  };

  return (
    <div className="w-full bg-[#050b1a] border-b border-cyber-primary/20 h-16 relative overflow-hidden flex items-center z-50 shrink-0">
      {/* Gradient Fade Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cyber-black to-transparent z-20 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cyber-black to-transparent z-20 pointer-events-none"></div>
      
      <div className="flex items-center w-full px-4 overflow-hidden">
         {/* Static Label */}
         <div className="flex-shrink-0 mr-6 flex items-center space-x-2 text-cyber-primary/70 border-r border-cyber-primary/20 pr-6 z-30 bg-[#050b1a]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-display text-sm tracking-widest uppercase font-bold text-white">LIVE</span>
         </div>

         {/* Scrolling List */}
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar scroll-smooth w-full mask-image-linear-gradient">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className={`
                flex-shrink-0 flex items-center space-x-3 bg-cyber-slate/30 border border-cyber-primary/10 hover:border-cyber-primary/30 
                rounded px-4 py-2 min-w-[180px] transition-all duration-500
                ${index === 0 && (currentTime - item.timestamp) < 2000 ? 'animate-in fade-in slide-in-from-left-8 duration-500' : ''}
              `}
            >
              <div className="w-8 h-8 rounded bg-cyber-dark flex items-center justify-center border border-cyber-primary/20 shrink-0">
                <User size={14} className="text-cyber-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-gray-200 truncate max-w-[100px] block">{item.name}</span>
                <div className="flex items-center space-x-1.5">
                   <Check size={10} className="text-green-400 shrink-0" />
                   <span className="text-[10px] text-green-400 font-mono font-medium">COPIED</span>
                   <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap opacity-60 min-w-[45px]">
                     {getTimeLabel(item.timestamp)}
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};