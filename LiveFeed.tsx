import React, { useState, useEffect, useRef } from 'react';
import { Check, User } from 'lucide-react';

export const LiveFeed: React.FC = () => {
  const [user, setUser] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  // Store previously used names to ensure uniqueness
  const usedNames = useRef<Set<string>>(new Set());

  // Generates a random realistic looking Roblox username
  const generateRandomUser = () => {
    const prefixes = ["xX", "The", "Real", "Super", "Cyber", "Dark", "Pro", "Blox", "Shadow", "Neon", "Hyper", "Ultra", "Mega", "Epic", "Void", "Pixel"];
    const roots = ["Gamer", "Ninja", "Warrior", "Dev", "Master", "Legend", "Player", "Copier", "Hunter", "Slayer", "Ghost", "Viper", "Phantom", "Striker", "Glitch", "Byte"];
    const suffixes = ["_HD", "123", "99", "2077", "X", "YT", "RBX", "_Plays", "55", "007", "88", "_Official", "3000", "XoX"];
    
    let newUser = "";
    let attempts = 0;
    
    // Try up to 20 times to find a unique name in the unlikely event of a collision
    do {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const root = roots[Math.floor(Math.random() * roots.length)];
      const suffix = Math.random() > 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : Math.floor(Math.random() * 9999).toString();
      newUser = `${prefix}${root}${suffix}`;
      attempts++;
    } while (usedNames.current.has(newUser) && attempts < 20);
    
    // Clean up history if it gets too large to save memory
    if (usedNames.current.size > 50) {
        const iterator = usedNames.current.values();
        const first = iterator.next().value;
        if (first) usedNames.current.delete(first);
    }
    
    usedNames.current.add(newUser);
    return newUser;
  };

  useEffect(() => {
    let timeoutId: any;

    const scheduleCycle = () => {
        // Generate new user and show notification
        const newUser = generateRandomUser();
        setUser(newUser);
        setIsVisible(true);

        // Hide after 5 seconds
        timeoutId = setTimeout(() => {
            setIsVisible(false);

            // Schedule next appearance randomly between 5 and 30 seconds
            // 5000ms + (0 to 25000ms)
            const randomDelay = Math.floor(Math.random() * (30000 - 5000 + 1)) + 5000;
            
            timeoutId = setTimeout(() => {
                scheduleCycle();
            }, randomDelay);
            
        }, 5000);
    };

    // Start the first cycle immediately
    scheduleCycle();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
       <div 
         className={`
           flex items-center space-x-3 bg-cyber-dark/90 border border-cyber-primary/40 
           backdrop-blur-xl px-5 py-3 rounded-lg shadow-lg shadow-cyber-primary/10
           transform transition-all duration-500 ease-out
           ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
         `}
       >
         <div className="relative">
            <div className="w-10 h-10 rounded-full bg-cyber-slate flex items-center justify-center overflow-hidden border border-cyber-primary/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
               <User size={20} className="text-cyber-primary" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-cyber-dark animate-pulse"></div>
         </div>
         
         <div className="flex flex-col">
            <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-sm text-gray-200 tracking-wide">{user}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-green-400">
                <Check size={14} strokeWidth={3} />
                <span className="font-mono font-semibold tracking-wider">COPIED</span>
            </div>
         </div>
       </div>
    </div>
  );
};