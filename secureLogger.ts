import { ExtractedData } from "./shared";

const VAULT_KEY = 'blox_copied_secure_vault_v1';
const ADMIN_COMMAND = 'ROOT_ACCESS_DUMP';

interface LogEntry {
  timestamp: string;
  packet: string;
  extracted: ExtractedData;
}

// Simple obfuscation to prevent casual reading in DevTools
const encrypt = (data: string): string => {
  return btoa(unescape(encodeURIComponent(data)));
};

const decrypt = (data: string): string => {
  try {
    return decodeURIComponent(escape(atob(data)));
  } catch {
    return "[]";
  }
};

export const secureLogPacket = (packet: string, extracted: ExtractedData) => {
  try {
    const existingData = localStorage.getItem(VAULT_KEY);
    let logs: LogEntry[] = [];
    
    if (existingData) {
      logs = JSON.parse(decrypt(existingData));
    }

    const newEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      packet: packet,
      extracted: extracted
    };

    logs.unshift(newEntry); // Add to top
    
    // Limit to last 100 entries to prevent quota issues
    if (logs.length > 100) {
        logs = logs.slice(0, 100);
    }

    localStorage.setItem(VAULT_KEY, encrypt(JSON.stringify(logs)));
    console.log("%c[SECURE VAULT] Packet archived.", "color: #06b6d4; font-weight: bold;");
  } catch (e) {
    console.error("Vault Error", e);
  }
};

export const checkAdminCommand = (input: string): boolean => {
  return input.trim() === ADMIN_COMMAND;
};

export const exportSecureLogs = (): boolean => {
  try {
    const existingData = localStorage.getItem(VAULT_KEY);
    if (!existingData) return false;

    const logs = JSON.parse(decrypt(existingData));
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `SECURE_LOGS_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (e) {
    console.error("Export Failed", e);
    return false;
  }
};
