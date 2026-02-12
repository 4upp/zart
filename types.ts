
export interface ScanResult {
  fileName: string;
  fileSize: string;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  metadata: Record<string, string>;
  downloadSizeKb: number;
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
