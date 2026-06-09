export interface Patient {
  age: number;
  sex: 'male' | 'female';
}

export interface Biomarker {
  name: string;
  value: string;
  unit: string;
  reference_range: string;
  classification: 'optimal' | 'normal' | 'out of range';
}

export interface BiomarkerResult {
  patient: Patient;
  biomarkers: Biomarker[];
  fileName: string;
  timestamp?: number;
  _debug?: {
    rawResponse: string;
    cleanedResponse: string;
  };
}

export interface BiomarkerHistory {
  biomarkerName: string;
  entries: Array<{
    value: number;
    timestamp: number;
    fileName: string;
    classification: 'optimal' | 'normal' | 'out of range';
    unit: string;
    referenceRange: string;
  }>;
}