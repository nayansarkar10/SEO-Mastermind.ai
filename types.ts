export enum AppView {
  DASHBOARD = 'DASHBOARD',
  KEYWORD_RESEARCH = 'KEYWORD_RESEARCH',
  CONTENT_OPTIMIZER = 'CONTENT_OPTIMIZER',
  META_GENERATOR = 'META_GENERATOR',
  IMAGE_GENERATOR = 'IMAGE_GENERATOR',
  CONSULTANT_CHAT = 'CONSULTANT_CHAT'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  date: string;
  author?: string;
}
