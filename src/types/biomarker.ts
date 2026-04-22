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
  _debug?: {
    rawResponse: string;
    cleanedResponse: string;
  };
}