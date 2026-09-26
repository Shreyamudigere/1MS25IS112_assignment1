export interface PaperMetadata {
  title: string;
  authors: string[];
  year?: string;
  venueOrOrg?: string;
  primaryDomain?: string;
  summaryTagline?: string;
  url?: string;
  pdfUrl?: string;
  arxivId?: string;
  published?: string;
}

export interface CoreConcept {
  wordCount: number;
  problemStatement: string;
  primaryMethodology: string;
  mathematicalBreakthroughs: string;
  fullSummary: string;
}

export interface ArchitectureComponent {
  name: string;
  role: string;
}

export interface ArchitecturalFlowchart {
  mermaidCode: string;
  dataInputs?: string[];
  components?: ArchitectureComponent[];
  modelLayers?: string[];
  dataOutputs?: string[];
}

export interface InternshipOpportunity {
  id: number;
  title: string;
  extension: string;
  targetMetric: string;
  techStack: string[];
  difficulty?: 'Intermediate 3rd Year' | 'Advanced 3rd Year' | 'Capstone Ready' | string;
  whyImpressive?: string;
  resumeBullet?: string;
  weeklyMilestones?: string[];
  recommendedStarterRepo?: string;
}

export interface TokenMetrics {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  tokenBudget: number;
  tokenBudgetPercent: number;
}

export interface PaperAnalysisResult {
  paper: PaperMetadata;
  coreConcept: CoreConcept;
  architecturalFlowchart: ArchitecturalFlowchart;
  internshipOpportunities: InternshipOpportunity[];
  rawOutput: string;
  tokenMetrics: TokenMetrics;
}

export interface CuratedPaper {
  id: string;
  title: string;
  authors: string;
  year: string;
  domain: string;
  tag: string;
  url: string;
  abstractSnippet: string;
  defaultAnalysis: PaperAnalysisResult;
}
