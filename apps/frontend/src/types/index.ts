
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  organization?: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'agreement' | 'policy' | 'terms' | 'other';
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  status: 'pending' | 'processing' | 'analyzed' | 'error';
  analysisId?: string;
  fileUrl: string;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  originalName: string;
  mimeType: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  confidentiality?: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface Analysis {
  id: string;
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  results: AnalysisResults;
  riskLevel: RiskLevel;
  summary: string;
  confidence: number; 
}

export interface AnalysisResults {
  overallRisk: RiskAssessment;
  clauses: ClauseAnalysis[];
  recommendations: Recommendation[];
  redFlags: RedFlag[];
  keyTerms: KeyTerm[];
  timeline?: TimelineEvent[];
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number; 
  factors: RiskFactor[];
  explanation: string;
}

export interface RiskFactor {
  id: string;
  name: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: RiskCategory;
  description: string;
  mitigation?: string;
}

export interface ClauseAnalysis {
  id: string;
  title: string;
  content: string;
  type: ClauseType;
  riskLevel: RiskLevel;
  issues: Issue[];
  recommendations: string[];
  confidence: number;
  startPosition: number;
  endPosition: number;
}

export interface Issue {
  id: string;
  type: IssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion?: string;
  relatedClause?: string;
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  action: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface RedFlag {
  id: string;
  title: string;
  description: string;
  severity: 'medium' | 'high' | 'critical';
  category: string;
  location: string;
  suggestion: string;
}

export interface KeyTerm {
  id: string;
  term: string;
  definition: string;
  importance: 'low' | 'medium' | 'high';
  category: string;
  relatedClauses: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'milestone' | 'deadline' | 'review' | 'action';
  importance: 'low' | 'medium' | 'high';
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskCategory = 'financial' | 'legal' | 'operational' | 'reputational' | 'compliance';
export type ClauseType = 'payment' | 'termination' | 'liability' | 'confidentiality' | 'intellectual_property' | 'governance' | 'compliance' | 'other';
export type IssueType = 'ambiguous' | 'missing' | 'unfavorable' | 'unusual' | 'non_compliant';
export type RecommendationType = 'add_clause' | 'modify_clause' | 'review_clause' | 'negotiate' | 'seek_legal_advice';

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv';
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeRawData: boolean;
  confidentialityLevel: 'public' | 'internal' | 'confidential';
}

export interface FilterOptions {
  riskLevel?: RiskLevel[];
  clauseType?: ClauseType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  searchQuery?: string;
}

export interface SortOptions {
  field: 'date' | 'risk' | 'name' | 'status';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalState {
  isOpen: boolean;
  type?: 'confirm' | 'form' | 'info';
  title?: string;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface UploadFormData {
  files: FileList;
  confidentiality: DocumentMetadata['confidentiality'];
  documentType: Document['type'];
  description?: string;
}

export interface AnalysisFormData {
  documentId: string;
  analysisType: 'standard' | 'comprehensive' | 'custom';
  focusAreas: string[];
  urgency: 'low' | 'medium' | 'high';
  notifyOnCompletion: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface RiskDistributionData extends ChartData {
  riskLevel: RiskLevel;
  count: number;
}

export interface TimelineData {
  date: string;
  value: number;
  label: string;
  type: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  neutral: string;
  background: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}
