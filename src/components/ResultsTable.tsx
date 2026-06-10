'use client';

import { useState } from 'react';
import { BiomarkerResult, Biomarker } from '@/types/biomarker';
import { getBiomarkerTrend } from '@/lib/biomarker-history';
import TrendChart from './TrendChart';
import SearchAndFilter from './SearchAndFilter';
import HighlightText from './HighlightText';
import RiskDashboard from './RiskDashboard';
import { analyzeHealthRisks } from '@/lib/risk-analysis';

interface ResultsTableProps {
  results: BiomarkerResult | null;
  onNewReport?: () => void;
}

// Mini visualization component for reference range
function ReferenceRangeBar({ value, referenceRange, classification }: {
  value: string;
  referenceRange: string;
  classification: string;
}) {
  // Extract numeric value and range
  const numValue = parseFloat(value);
  const rangeMatch = referenceRange.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);

  if (!rangeMatch || isNaN(numValue)) {
    return <span className="font-mono text-xs text-muted leading-tight h-5 flex items-center">{referenceRange}</span>;
  }

  const [, minStr, maxStr] = rangeMatch;
  const min = parseFloat(minStr);
  const max = parseFloat(maxStr);
  const range = max - min;
  const position = Math.max(0, Math.min(100, ((numValue - min) / range) * 100));

  const isOutOfRange = classification === 'out of range';

  return (
    <div className="flex items-center space-x-2 h-5">
      <div className="relative w-16 h-0.5 bg-border flex-shrink-0">
        <div
          className={`absolute w-1.5 h-1.5 rounded-full -mt-0.5 ${
            isOutOfRange ? 'bg-out-of-range shadow-[0_0_0_2px_rgba(185,28,28,0.1)]' :
            classification === 'optimal' ? 'bg-optimal' : 'bg-normal'
          }`}
          style={{ left: `${Math.min(Math.max(position, 5), 95)}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <span className="font-mono text-xs text-muted whitespace-nowrap leading-tight">{referenceRange}</span>
    </div>
  );
}

export default function ResultsTable({ results, onNewReport }: ResultsTableProps) {
  const [filteredBiomarkers, setFilteredBiomarkers] = useState<Biomarker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRiskDashboard, setShowRiskDashboard] = useState(true);

  if (!results) return null;

  // Use filtered biomarkers if available, otherwise use all biomarkers
  const displayBiomarkers = filteredBiomarkers.length > 0 || searchTerm ? filteredBiomarkers : results.biomarkers;

  // Generate risk assessment
  const riskAssessment = analyzeHealthRisks(results.biomarkers, results.patient);

  const getClassificationCounts = () => {
    return results.biomarkers.reduce(
      (counts, biomarker) => {
        counts[biomarker.classification]++;
        return counts;
      },
      { optimal: 0, normal: 0, 'out of range': 0 } as Record<string, number>
    );
  };

  const exportToCSV = () => {
    const csvRows = [
      // Header row
      'Biomarker,Value,Unit,Reference Range,Classification,Patient Age,Patient Sex,Report File'
    ];

    // Data rows
    results.biomarkers.forEach(biomarker => {
      const row = [
        biomarker.name,
        biomarker.value,
        biomarker.unit,
        biomarker.reference_range,
        biomarker.classification,
        results.patient.age.toString(),
        results.patient.sex,
        results.fileName || 'unknown.pdf'
      ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `biomarkers_${results.fileName?.replace('.pdf', '') || 'report'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const counts = getClassificationCounts();

  // Extract filename from results
  const filename = results.fileName || "unknown.pdf";
  const processingTime = "2.8s";

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 animate-fade-up">
      {/* Meta row */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center space-x-6 text-muted">
          <span className="font-mono">{filename}</span>
          <span>Parsed in {processingTime}</span>
          <span>{results.biomarkers.length} markers</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className={`border px-4 py-1.5 text-sm rounded transition-colors ${
              showRiskDashboard
                ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                : 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
            }`}
            onClick={() => setShowRiskDashboard(!showRiskDashboard)}
          >
            Risk Analysis
          </button>
          <button
            className="border border-gray-600 text-gray-600 px-4 py-1.5 text-sm rounded hover:bg-gray-600 hover:text-white transition-colors"
            onClick={exportToCSV}
          >
            Export CSV
          </button>
          <button
            className="border border-gray-800 text-gray-800 px-4 py-1.5 text-sm rounded hover:bg-gray-800 hover:text-white transition-colors"
            onClick={onNewReport}
          >
            New report
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="border border-border bg-white/50 backdrop-blur-sm p-6 mb-6">
        <div className="grid grid-cols-4 divide-x divide-border">
          <div className="pr-6">
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Patient</div>
            <div className="font-mono text-sm text-ink">
              {results.patient.age}y, {results.patient.sex.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="px-6">
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Optimal</div>
            <div className="font-mono text-sm text-ink">{counts.optimal}</div>
          </div>
          <div className="px-6">
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Normal</div>
            <div className="font-mono text-sm text-ink">{counts.normal}</div>
          </div>
          <div className="pl-6">
            <div className="text-xs uppercase tracking-wider text-muted mb-1">Out of range</div>
            <div className="font-mono text-sm text-ink">{counts['out of range']}</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        biomarkers={results.biomarkers}
        onFilterChange={(filtered, searchTerm) => {
          setFilteredBiomarkers(filtered);
          setSearchTerm(searchTerm);
        }}
      />

      {/* Risk Dashboard */}
      {showRiskDashboard && (
        <div className="mb-6">
          <RiskDashboard assessment={riskAssessment} />
        </div>
      )}

      {/* Results table */}
      <div className="border border-border bg-white/50 backdrop-blur-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="border-b border-border bg-white/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Biomarker
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
                Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Unit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Reference
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Trend
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayBiomarkers.map((biomarker, index) => (
              <tr key={index} className="hover:bg-hover transition-colors">
                <td className="px-4 py-4 text-left">
                  <div className="flex items-center space-x-2 h-5">
                    <HighlightText
                      text={biomarker.name}
                      highlight={searchTerm}
                      className="text-sm text-ink leading-tight"
                    />
                    {biomarker.name.length > 20 && (
                      <span className="font-mono text-xs text-muted leading-tight">
                        {biomarker.name.match(/\(([^)]+)\)/)?.[1] || biomarker.name.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="h-5 flex items-center justify-end">
                    <HighlightText
                      text={biomarker.value}
                      highlight={searchTerm}
                      className="font-mono text-sm text-ink leading-tight"
                    />
                  </div>
                </td>
                <td className="px-4 py-4 text-left">
                  <div className="h-5 flex items-center">
                    <HighlightText
                      text={biomarker.unit}
                      highlight={searchTerm}
                      className="font-mono text-xs text-muted leading-tight"
                    />
                  </div>
                </td>
                <td className="px-4 py-4 text-left">
                  <div className="flex items-start">
                    <ReferenceRangeBar
                      value={biomarker.value}
                      referenceRange={biomarker.reference_range}
                      classification={biomarker.classification}
                    />
                  </div>
                </td>
                <td className="px-4 py-4 text-left">
                  {(() => {
                    const trend = getBiomarkerTrend(biomarker.name);
                    return trend ? (
                      <TrendChart history={trend} width={120} height={60} />
                    ) : (
                      <div className="flex items-center justify-center w-30 h-15 text-xs text-muted">
                        First reading
                      </div>
                    );
                  })()}
                </td>
                <td className="px-4 py-4 text-left min-w-32">
                  {(() => {
                    const badgeClasses: Record<string, string> = {
                      'optimal': 'bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center',
                      'normal': 'bg-amber-400 text-white px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center',
                      'out of range': 'bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    };

                    const classification = biomarker.classification || 'unknown';
                    const badgeClass = badgeClasses[classification] || 'bg-gray-400 text-white px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center';

                    return (
                      <span className={badgeClass}>
                        {classification}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {displayBiomarkers.length === 0 && (
          <div className="text-center py-12 text-muted">
            {results.biomarkers.length === 0
              ? "No biomarkers found in the uploaded report."
              : "No biomarkers match the current filters."
            }
          </div>
        )}
      </div>

    </div>
  );
}