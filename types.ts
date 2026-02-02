export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export enum ProficiencyLevel {
  BEGINNER = 'Beginner (A1-A2)',
  INTERMEDIATE = 'Intermediate (B1-B2)',
  ADVANCED = 'Advanced (C1-C2)',
}

export interface UserSettings {
  name: string;
  level: ProficiencyLevel;
  topic: string;
}

export interface TranscriptionItem {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}
