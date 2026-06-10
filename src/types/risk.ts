export interface RiskFactor {
  category: 'cardiovascular' | 'metabolic' | 'liver' | 'kidney' | 'inflammatory';
  name: string;
  severity: 'low' | 'moderate' | 'high';
  description: string;
  biomarkers: string[];
  recommendation: string;
}

export interface RiskAssessment {
  overallScore: number; // 0-100
  riskLevel: 'low' | 'moderate' | 'high';
  factors: RiskFactor[];
  insights: string[];
  recommendations: string[];
  summary: string;
}

export interface BiomarkerRiskData {
  name: string;
  value: number;
  classification: 'optimal' | 'normal' | 'out of range';
  riskContribution: number; // -1 to 1 (negative is protective, positive is risk)
}