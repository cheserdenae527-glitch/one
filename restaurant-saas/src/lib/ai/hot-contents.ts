export interface HotContent {
  id: string; title: string; platform: string; likesCount: number;
  cuisineType: string; briefContent: string; hotScore: number;
  url: string; publishTime: string; contentType: string;
  imageUrl?: string; analysis?: HotContentAnalysis;
}

export interface HotContentAnalysis {
  writingStyle: string;
  hookType: string;
  structure: string[];
  toneTags: string[];
  visualStyle?: string;
  promptTemplate: string;
}