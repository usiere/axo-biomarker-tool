'use client';

import { useState } from 'react';
import { getBiomarkerHistory } from '@/lib/biomarker-history';

interface ComparisonData {
  biomarkerName: string;
  values: Array<{
    value: number;
    date: string;
    fileName: string;
    classification: string;
  }>;
  trend: 'improving' | 'stable' | 'declining';
}

export default function ComparisonTool() {
  const [selectedBiomarkers, setSelectedBiomarkers] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const history = getBiomarkerHistory();
  const availableBiomarkers = history.map(h => h.biomarkerName);

  const getComparisonData = (): ComparisonData[] => {
    return selectedBiomarkers.map(biomarkerName => {
      const biomarkerHistory = history.find(h => h.biomarkerName === biomarkerName);
      if (!biomarkerHistory) return { biomarkerName, values: [], trend: 'stable' };

      const values = biomarkerHistory.entries
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-5) // Last 5 readings
        .map(entry => ({
          value: entry.value,
          date: new Date(entry.timestamp).toLocaleDateString(),
          fileName: entry.fileName,
          classification: entry.classification
        }));

      // Calculate trend
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (values.length >= 2) {
        const first = values[0];
        const last = values[values.length - 1];

        if (last.classification === 'optimal' && first.classification !== 'optimal') {
          trend = 'improving';
        } else if (last.classification === 'out of range' && first.classification !== 'out of range') {
          trend = 'declining';
        } else if (values.length >= 3) {
          // Check overall direction
          const slope = (last.value - first.value) / (values.length - 1);
          if (Math.abs(slope) > 0.1) {
            trend = slope > 0 ? 'declining' : 'improving'; // Assuming lower is better for most markers
          }
        }
      }

      return { biomarkerName, values, trend };
    });
  };

  const toggleBiomarker = (biomarker: string) => {
    setSelectedBiomarkers(prev =>
      prev.includes(biomarker)
        ? prev.filter(b => b !== biomarker)
        : [...prev, biomarker]
    );
  };

  if (availableBiomarkers.length === 0) {
    return (
      <div className="border border-border bg-white/50 backdrop-blur-sm rounded-lg p-6 text-center">
        <p className="text-muted">Upload multiple reports to compare biomarker trends over time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📊</span>
          <h3 className="text-lg font-semibold text-ink">Biomarker Comparison</h3>
        </div>

        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`px-4 py-2 text-sm rounded transition-colors ${
            showComparison
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
          }`}
        >
          {showComparison ? 'Hide Comparison' : 'Compare Biomarkers'}
        </button>
      </div>

      {showComparison && (
        <>
          {/* Biomarker Selection */}
          <div className="border border-border bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <h4 className="font-medium text-ink mb-3">Select biomarkers to compare:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableBiomarkers.map(biomarker => (
                <label key={biomarker} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBiomarkers.includes(biomarker)}
                    onChange={() => toggleBiomarker(biomarker)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-ink">{biomarker}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Comparison Results */}
          {selectedBiomarkers.length > 0 && (
            <div className="space-y-4">
              {getComparisonData().map(data => (
                <div key={data.biomarkerName} className="border border-border bg-white/50 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-ink">{data.biomarkerName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data.trend === 'improving' ? 'bg-green-100 text-green-800' :
                      data.trend === 'declining' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {data.trend === 'improving' ? '↗ Improving' :
                       data.trend === 'declining' ? '↘ Declining' : '→ Stable'}
                    </span>
                  </div>

                  {data.values.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-xs font-medium text-muted uppercase tracking-wider py-2">Date</th>
                            <th className="text-right text-xs font-medium text-muted uppercase tracking-wider py-2">Value</th>
                            <th className="text-left text-xs font-medium text-muted uppercase tracking-wider py-2">Status</th>
                            <th className="text-left text-xs font-medium text-muted uppercase tracking-wider py-2">Report</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {data.values.map((value, index) => (
                            <tr key={index}>
                              <td className="py-2 text-sm text-ink">{value.date}</td>
                              <td className="py-2 text-sm text-ink text-right font-mono">{value.value}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  value.classification === 'optimal' ? 'bg-green-500 text-white' :
                                  value.classification === 'normal' ? 'bg-yellow-500 text-white' :
                                  'bg-red-500 text-white'
                                }`}>
                                  {value.classification}
                                </span>
                              </td>
                              <td className="py-2 text-sm text-muted truncate max-w-32">{value.fileName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">No data available for comparison.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}