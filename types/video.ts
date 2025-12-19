export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  channelName: string;
  channelId: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface ProcessedVideo {
  metadata: VideoMetadata;
  audioPath: string;
  framePaths: string[];
  transcript: TranscriptSegment[];
}

export interface UploadedVideo {
  id: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  duration: number;
}

export interface VideoProcessingStatus {
  stage: 'downloading' | 'extracting-audio' | 'extracting-frames' | 'transcribing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface FrameAnalysis {
  timestamp: number;
  hasFace: boolean;
  hasTextOverlay: boolean;
  dominantColors: string[];
  brightness: number;
}
