import { BiomarkerResult, BiomarkerHistory } from '@/types/biomarker';

const STORAGE_KEY = 'biomarker-history';

export function saveBiomarkerResult(result: BiomarkerResult): void {
  try {
    const timestamp = Date.now();
    const existingHistory = getBiomarkerHistory();

    // Process each biomarker in the result
    result.biomarkers.forEach(biomarker => {
      const numericValue = parseFloat(biomarker.value);

      // Only track biomarkers with numeric values
      if (!isNaN(numericValue)) {
        const existingBiomarker = existingHistory.find(h => h.biomarkerName === biomarker.name);

        const newEntry = {
          value: numericValue,
          timestamp,
          fileName: result.fileName,
          classification: biomarker.classification,
          unit: biomarker.unit,
          referenceRange: biomarker.reference_range
        };

        if (existingBiomarker) {
          existingBiomarker.entries.push(newEntry);
          // Keep only last 20 entries per biomarker
          existingBiomarker.entries = existingBiomarker.entries
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20);
        } else {
          existingHistory.push({
            biomarkerName: biomarker.name,
            entries: [newEntry]
          });
        }
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingHistory));
  } catch (error) {
    console.error('Error saving biomarker history:', error);
  }
}

export function getBiomarkerHistory(): BiomarkerHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading biomarker history:', error);
    return [];
  }
}

export function getBiomarkerTrend(biomarkerName: string): BiomarkerHistory | null {
  const history = getBiomarkerHistory();
  return history.find(h => h.biomarkerName === biomarkerName) || null;
}

export function clearBiomarkerHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing biomarker history:', error);
  }
}

export function getHistoryStats(): { totalReports: number; totalBiomarkers: number; dateRange: { oldest: number | null; newest: number | null } } {
  const history = getBiomarkerHistory();

  if (history.length === 0) {
    return { totalReports: 0, totalBiomarkers: 0, dateRange: { oldest: null, newest: null } };
  }

  const allTimestamps = history
    .flatMap(h => h.entries.map(e => e.timestamp))
    .sort((a, b) => a - b);

  const uniqueReports = new Set(history.flatMap(h => h.entries.map(e => e.fileName)));

  return {
    totalReports: uniqueReports.size,
    totalBiomarkers: history.length,
    dateRange: {
      oldest: allTimestamps[0] || null,
      newest: allTimestamps[allTimestamps.length - 1] || null
    }
  };
}