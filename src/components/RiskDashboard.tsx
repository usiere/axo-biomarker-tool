'use client';

import { RiskAssessment, RiskFactor } from '@/types/risk';

interface RiskDashboardProps {
  assessment: RiskAssessment;
}

function RiskScore({ score, level }: { score: number; level: 'low' | 'moderate' | 'high' }) {
  const getScoreColor = () => {
    if (level === 'low') return 'text-green-600';
    if (level === 'moderate') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = () => {
    if (level === 'low') return 'bg-green-100';
    if (level === 'moderate') return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getBorderColor = () => {
    if (level === 'low') return 'border-green-200';
    if (level === 'moderate') return 'border-yellow-200';
    return 'border-red-200';
  };

  return (
    <div className={`${getScoreBackground()} ${getBorderColor()} border-2 rounded-xl p-6 text-center`}>
      <div className="mb-2">
        <div className={`text-4xl font-bold ${getScoreColor()}`}>{score}</div>
        <div className="text-sm text-muted uppercase tracking-wider">Risk Score</div>
      </div>

      {/* Risk meter visual */}
      <div className="relative h-2 bg-gray-200 rounded-full mb-2">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${
            level === 'low' ? 'bg-green-500' :
            level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      <div className={`text-sm font-medium ${getScoreColor()} capitalize`}>
        {level} Risk
      </div>
    </div>
  );
}

function RiskFactorCard({ factor }: { factor: RiskFactor }) {
  const getSeverityColor = () => {
    if (factor.severity === 'low') return 'border-green-200 bg-green-50';
    if (factor.severity === 'moderate') return 'border-yellow-200 bg-yellow-50';
    return 'border-red-200 bg-red-50';
  };

  const getSeverityBadge = () => {
    if (factor.severity === 'low') return 'bg-green-500 text-white';
    if (factor.severity === 'moderate') return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getCategoryIcon = () => {
    switch (factor.category) {
      case 'cardiovascular': return '❤️';
      case 'metabolic': return '🔥';
      case 'liver': return '🫘';
      case 'kidney': return '💧';
      case 'inflammatory': return '🔥';
      default: return '⚕️';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCategoryIcon()}</span>
          <span className="font-medium text-ink">{factor.name}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge()}`}>
          {factor.severity}
        </span>
      </div>

      <p className="text-sm text-muted mb-3">{factor.description}</p>

      <div className="mb-3">
        <div className="text-xs text-muted mb-1">Affected biomarkers:</div>
        <div className="flex flex-wrap gap-1">
          {factor.biomarkers.map((biomarker, index) => (
            <span key={index} className="text-xs bg-white/60 px-2 py-1 rounded border">
              {biomarker}
            </span>
          ))}
        </div>
      </div>

      <div className="text-xs text-ink bg-white/80 p-2 rounded border">
        <strong>Recommendation:</strong> {factor.recommendation}
      </div>
    </div>
  );
}

export default function RiskDashboard({ assessment }: RiskDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <span className="text-xl">🩺</span>
        <h3 className="text-lg font-semibold text-ink">Health Risk Assessment</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score */}
        <div className="lg:col-span-1">
          <RiskScore score={assessment.overallScore} level={assessment.riskLevel} />
        </div>

        {/* Summary and Insights */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          <div className="border border-border bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <h4 className="font-medium text-ink mb-2">Assessment Summary</h4>
            <p className="text-sm text-muted">{assessment.summary}</p>
          </div>

          {/* Key Insights */}
          {assessment.insights.length > 0 && (
            <div className="border border-border bg-white/50 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-medium text-ink mb-2">Key Insights</h4>
              <ul className="space-y-1">
                {assessment.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-muted flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-ink rounded-full flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Risk Factors */}
      {assessment.factors.length > 0 && (
        <div>
          <h4 className="font-medium text-ink mb-3">Risk Factors Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessment.factors.map((factor, index) => (
              <RiskFactorCard key={index} factor={factor} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="border border-border bg-white/50 backdrop-blur-sm rounded-lg p-4">
        <h4 className="font-medium text-ink mb-3">Recommendations</h4>
        <ul className="space-y-2">
          {assessment.recommendations.map((rec, index) => (
            <li key={index} className="text-sm text-muted flex items-start space-x-3">
              <span className="text-green-600 font-bold text-base">✓</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3 text-center">
        <p className="text-xs text-yellow-800">
          <strong>Disclaimer:</strong> This assessment is for informational purposes only and should not replace professional medical advice.
          Always consult with healthcare providers for proper diagnosis and treatment.
        </p>
      </div>
    </div>
  );
}