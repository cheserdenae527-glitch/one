export interface TrendAnalysisResult {
  postInfo: {
    title: string;
    platform: string;
    likes: number;
    saves: number;
    comments: number;
    publishTime: string;
  };
  topic: {
    primaryCategory: string;
    angle: string;
    replayable: boolean;
    replayHint?: string;
  };
  hook: {
    type: string;
    text: string;
    effectiveness: string;
  };
  structure: {
    pattern: string;
    bodyLength: number;
    paragraphCount: number;
    imageTextRatio: string;
  };
  toneAndKeywords: {
    tone: string;
    keywords: string[];
    keywordStrategy: string;
  };
  engagementTriggers: {
    likesWhy: string;
    savesWhy: string;
    shareWhy: string;
  };
  comments: {
    totalCommentCount: number;
    topWords: string[];
    sentimentDistribution: Record<string, string>;
    realUserSignals: string[];
    controversyPoints: string[];
  };
  whyItWorks: {
    summary: string;
    replicabilityScore: number;
    replicableElements: string[];
    riskFactors: string[];
  };
}

export interface MerchantMatchedAnalysis {
  relevanceToYou: {
    score: number;
    matchReason: string;
    mismatchWarning?: string;
  };
  howToAdapt: Array<{
    element: string;
    original: string;
    adapted: string;
    why: string;
  }>;
  actionPriority: "high" | "medium" | "low";
  suggestedAction: string;
}
