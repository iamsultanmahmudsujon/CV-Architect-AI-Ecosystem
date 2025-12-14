
export interface AnalysisScore {
  atsScore: number;
  keywordMatch: number;
  skillsScore: number;
  experienceScore: number;
  formatScore: number;
  overallScore: number;
}

export interface SectionFeedback {
  sectionName: string;
  status: 'good' | 'warning' | 'critical' | 'missing';
  feedback: string;
  suggestion: string;
}

export interface KeywordAnalysis {
  present: string[];
  missing: string[];
  score: number;
}

export interface LearningResource {
  skill: string;
  recommendation: string; // e.g. "Coursera - Python for Everybody"
  type: 'Course' | 'Article' | 'Project';
}

export interface SalaryEstimation {
  min: string;
  max: string;
  currency: string;
  explanation: string;
}

export interface LinkedinAudit {
  headline: string;
  aboutSummary: string;
  missingSections: string[];
  bannerSuggestion: string;
}

export interface ProjectIdea {
  title: string;
  description: string;
  techStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface HeadshotAnalysis {
  score: number;
  professionalism: string;
  lighting: string;
  background: string;
  attire: string;
  expression: string;
  tips: string[];
}

export interface AnalysisResult {
  scores: AnalysisScore;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  keywords: KeywordAnalysis;
  sectionAnalysis: SectionFeedback[];
  rewrittenSummary?: string;
  marketFit: string;
  interviewQuestions: string[];
  coverLetter: string;
  // New Ecosystem Features
  salaryEstimation: SalaryEstimation;
  linkedinAudit: LinkedinAudit;
  learningPath: LearningResource[];
  projectIdeas: ProjectIdea[];
  headshotAnalysis?: HeadshotAnalysis; // New Vision Feature
  timestamp?: number; // For history
  jobTitleDetected?: string; // For history title
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
}

export interface UserInput {
  cvText: string;
  fileData?: string; // Base64 string
  fileMimeType?: string;
  jobDescription: string;
  targetMarket: string;
}

export interface HistoryItem {
  id: string;
  date: number;
  title: string;
  score: number;
  result: AnalysisResult;
}
