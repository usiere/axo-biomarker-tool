import { Biomarker, Patient } from '@/types/biomarker';
import { RiskAssessment, RiskFactor, BiomarkerRiskData } from '@/types/risk';

// Biomarker risk patterns and thresholds
const RISK_PATTERNS = {
  cardiovascular: {
    markers: ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'crp', 'c-reactive protein'],
    highRisk: ['ldl > 160', 'cholesterol > 240', 'triglycerides > 200', 'crp > 3'],
    moderate: ['ldl 130-160', 'cholesterol 200-240', 'triglycerides 150-200']
  },
  metabolic: {
    markers: ['glucose', 'hba1c', 'insulin', 'hemoglobin a1c'],
    highRisk: ['glucose > 126', 'hba1c > 7', 'hemoglobin a1c > 7'],
    moderate: ['glucose 100-126', 'hba1c 5.7-7', 'hemoglobin a1c 5.7-7']
  },
  liver: {
    markers: ['alt', 'ast', 'bilirubin', 'albumin', 'alp'],
    highRisk: ['alt > 40', 'ast > 40', 'bilirubin > 1.2'],
    moderate: ['alt 30-40', 'ast 30-40', 'bilirubin 0.8-1.2']
  },
  kidney: {
    markers: ['creatinine', 'bun', 'urea', 'egfr'],
    highRisk: ['creatinine > 1.3', 'bun > 20', 'egfr < 60'],
    moderate: ['creatinine 1.1-1.3', 'bun 15-20', 'egfr 60-90']
  },
  inflammatory: {
    markers: ['esr', 'crp', 'c-reactive protein', 'wbc', 'white blood cell'],
    highRisk: ['esr > 30', 'crp > 3', 'c-reactive protein > 3'],
    moderate: ['esr 15-30', 'crp 1-3', 'c-reactive protein 1-3']
  }
};

function normalizeBiomarkerName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractNumericValue(valueStr: string): number | null {
  const match = valueStr.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

function findBiomarkerCategory(name: string): string | null {
  const normalized = normalizeBiomarkerName(name);

  for (const [category, data] of Object.entries(RISK_PATTERNS)) {
    if (data.markers.some(marker => normalized.includes(normalizeBiomarkerName(marker)))) {
      return category;
    }
  }
  return null;
}

function calculateRiskContribution(biomarker: Biomarker): number {
  const value = extractNumericValue(biomarker.value);
  if (value === null) return 0;

  // Base risk on classification
  switch (biomarker.classification) {
    case 'optimal': return -0.3; // Protective
    case 'normal': return 0; // Neutral
    case 'out of range': return 0.7; // Risk
    default: return 0;
  }
}

function assessCardiovascularRisk(biomarkers: BiomarkerRiskData[]): RiskFactor | null {
  const cardioMarkers = biomarkers.filter(b =>
    findBiomarkerCategory(b.name) === 'cardiovascular'
  );

  if (cardioMarkers.length === 0) return null;

  const riskScore = cardioMarkers.reduce((sum, marker) => sum + marker.riskContribution, 0);
  const avgRisk = riskScore / cardioMarkers.length;

  let severity: 'low' | 'moderate' | 'high';
  let description: string;
  let recommendation: string;

  if (avgRisk > 0.4) {
    severity = 'high';
    description = 'Multiple cardiovascular risk factors detected. Elevated cholesterol and inflammatory markers indicate increased heart disease risk.';
    recommendation = 'Consult a cardiologist for comprehensive evaluation. Consider lifestyle modifications and possible medication.';
  } else if (avgRisk > 0.1) {
    severity = 'moderate';
    description = 'Some cardiovascular risk factors present. Lipid profile shows areas for improvement.';
    recommendation = 'Focus on heart-healthy diet, regular exercise, and monitor cholesterol levels regularly.';
  } else {
    severity = 'low';
    description = 'Cardiovascular markers are within healthy ranges.';
    recommendation = 'Maintain current lifestyle with regular exercise and balanced diet.';
  }

  return {
    category: 'cardiovascular',
    name: 'Cardiovascular Risk',
    severity,
    description,
    biomarkers: cardioMarkers.map(m => m.name),
    recommendation
  };
}

function assessMetabolicRisk(biomarkers: BiomarkerRiskData[]): RiskFactor | null {
  const metaMarkers = biomarkers.filter(b =>
    findBiomarkerCategory(b.name) === 'metabolic'
  );

  if (metaMarkers.length === 0) return null;

  const riskScore = metaMarkers.reduce((sum, marker) => sum + marker.riskContribution, 0);
  const avgRisk = riskScore / metaMarkers.length;

  let severity: 'low' | 'moderate' | 'high';
  let description: string;
  let recommendation: string;

  if (avgRisk > 0.4) {
    severity = 'high';
    description = 'Elevated glucose levels suggest diabetes risk or poor glycemic control.';
    recommendation = 'Consult an endocrinologist. Consider diabetes screening and blood sugar monitoring.';
  } else if (avgRisk > 0.1) {
    severity = 'moderate';
    description = 'Blood sugar levels are elevated but not in diabetic range (prediabetes).';
    recommendation = 'Implement dietary changes, increase physical activity, and monitor glucose regularly.';
  } else {
    severity = 'low';
    description = 'Glucose metabolism appears healthy.';
    recommendation = 'Continue current habits and regular monitoring.';
  }

  return {
    category: 'metabolic',
    name: 'Metabolic Health',
    severity,
    description,
    biomarkers: metaMarkers.map(m => m.name),
    recommendation
  };
}

export function analyzeHealthRisks(biomarkers: Biomarker[], patient: Patient): RiskAssessment {
  // Convert biomarkers to risk data
  const riskData: BiomarkerRiskData[] = biomarkers.map(biomarker => ({
    name: biomarker.name,
    value: extractNumericValue(biomarker.value) || 0,
    classification: biomarker.classification,
    riskContribution: calculateRiskContribution(biomarker)
  }));

  // Assess different risk categories
  const riskFactors: RiskFactor[] = [];

  const cardioRisk = assessCardiovascularRisk(riskData);
  if (cardioRisk) riskFactors.push(cardioRisk);

  const metaRisk = assessMetabolicRisk(riskData);
  if (metaRisk) riskFactors.push(metaRisk);

  // Calculate overall risk score
  const outOfRangeCount = biomarkers.filter(b => b.classification === 'out of range').length;
  const totalBiomarkers = biomarkers.length;
  const outOfRangeRatio = outOfRangeCount / totalBiomarkers;

  const overallScore = Math.round((outOfRangeRatio * 70) + (riskFactors.length * 15));

  let riskLevel: 'low' | 'moderate' | 'high';
  if (overallScore >= 70) riskLevel = 'high';
  else if (overallScore >= 40) riskLevel = 'moderate';
  else riskLevel = 'low';

  // Generate insights
  const insights: string[] = [];
  const optimalCount = biomarkers.filter(b => b.classification === 'optimal').length;

  if (optimalCount > totalBiomarkers * 0.7) {
    insights.push(`${Math.round(optimalCount/totalBiomarkers*100)}% of biomarkers are in optimal range`);
  }

  if (outOfRangeCount > 0) {
    insights.push(`${outOfRangeCount} biomarker${outOfRangeCount > 1 ? 's' : ''} require attention`);
  }

  // Age-specific insights
  if (patient.age > 50 && cardioRisk?.severity !== 'low') {
    insights.push('Age-related cardiovascular monitoring recommended');
  }

  // Generate recommendations
  const recommendations: string[] = [
    'Schedule regular follow-up testing',
    'Maintain detailed health records',
    'Discuss results with healthcare provider'
  ];

  if (riskLevel === 'high') {
    recommendations.unshift('Seek immediate medical consultation');
  }

  // Generate summary
  let summary: string;
  if (riskLevel === 'low') {
    summary = 'Overall health markers look good. Continue current healthy lifestyle practices.';
  } else if (riskLevel === 'moderate') {
    summary = 'Some health markers need attention. Focus on targeted lifestyle improvements.';
  } else {
    summary = 'Multiple health concerns detected. Medical consultation strongly recommended.';
  }

  return {
    overallScore,
    riskLevel,
    factors: riskFactors,
    insights,
    recommendations,
    summary
  };
}