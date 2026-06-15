import { BiomarkerResult } from '@/types/biomarker';
import { RiskAssessment } from '@/types/risk';

export interface ReportData {
  results: BiomarkerResult;
  riskAssessment: RiskAssessment;
  generatedAt: string;
}

export function generateHTMLReport(data: ReportData): string {
  const { results, riskAssessment, generatedAt } = data;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#22c55e';
      case 'moderate': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'optimal': return '#22c55e';
      case 'normal': return '#f59e0b';
      case 'out of range': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Report - ${results.fileName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
            padding: 2rem;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            color: white;
            padding: 2rem;
            text-align: center;
        }

        .content {
            padding: 2rem;
        }

        .section {
            margin-bottom: 2rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 2rem;
        }

        .section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .section h2 {
            color: #1f2937;
            margin-bottom: 1rem;
            font-size: 1.25rem;
            font-weight: 600;
        }

        .patient-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 8px;
        }

        .risk-score {
            text-align: center;
            background: #f3f4f6;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }

        .risk-score h3 {
            font-size: 2rem;
            font-weight: bold;
            color: ${getRiskColor(riskAssessment.riskLevel)};
            margin-bottom: 0.5rem;
        }

        .risk-level {
            text-transform: uppercase;
            font-weight: 600;
            color: ${getRiskColor(riskAssessment.riskLevel)};
            letter-spacing: 0.1em;
        }

        .biomarkers-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }

        .biomarkers-table th,
        .biomarkers-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        .biomarkers-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
        }

        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            color: white;
        }

        .insights-list {
            list-style: none;
        }

        .insights-list li {
            margin-bottom: 0.5rem;
            padding-left: 1.5rem;
            position: relative;
        }

        .insights-list li::before {
            content: "•";
            color: #3b82f6;
            font-weight: bold;
            position: absolute;
            left: 0;
        }

        .recommendations-list {
            list-style: none;
        }

        .recommendations-list li {
            margin-bottom: 0.5rem;
            padding-left: 1.5rem;
            position: relative;
        }

        .recommendations-list li::before {
            content: "✓";
            color: #22c55e;
            font-weight: bold;
            position: absolute;
            left: 0;
        }

        .footer {
            text-align: center;
            padding: 1rem;
            color: #6b7280;
            font-size: 0.875rem;
            border-top: 1px solid #e5e7eb;
        }

        @media print {
            body {
                padding: 0;
                background: white;
            }

            .container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Health Analysis Report</h1>
            <p>Comprehensive biomarker analysis and risk assessment</p>
            <p style="margin-top: 1rem; opacity: 0.9;">Generated on ${generatedAt}</p>
        </div>

        <div class="content">
            <!-- Patient Information -->
            <div class="section">
                <h2>Patient Information</h2>
                <div class="patient-info">
                    <div>
                        <strong>Age:</strong> ${results.patient.age} years
                    </div>
                    <div>
                        <strong>Sex:</strong> ${results.patient.sex.charAt(0).toUpperCase() + results.patient.sex.slice(1)}
                    </div>
                    <div>
                        <strong>Source File:</strong> ${results.fileName}
                    </div>
                    <div>
                        <strong>Total Biomarkers:</strong> ${results.biomarkers.length}
                    </div>
                </div>
            </div>

            <!-- Risk Assessment -->
            <div class="section">
                <h2>Risk Assessment</h2>
                <div class="risk-score">
                    <h3>${riskAssessment.overallScore}/100</h3>
                    <div class="risk-level">${riskAssessment.riskLevel} Risk</div>
                </div>
                <p><strong>Summary:</strong> ${riskAssessment.summary}</p>
            </div>

            <!-- Key Insights -->
            ${riskAssessment.insights.length > 0 ? `
            <div class="section">
                <h2>Key Insights</h2>
                <ul class="insights-list">
                    ${riskAssessment.insights.map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <!-- Biomarkers Table -->
            <div class="section">
                <h2>Biomarker Results</h2>
                <table class="biomarkers-table">
                    <thead>
                        <tr>
                            <th>Biomarker</th>
                            <th>Value</th>
                            <th>Unit</th>
                            <th>Reference Range</th>
                            <th>Classification</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.biomarkers.map(biomarker => `
                        <tr>
                            <td>${biomarker.name}</td>
                            <td style="font-family: monospace;">${biomarker.value}</td>
                            <td style="font-family: monospace; color: #6b7280;">${biomarker.unit}</td>
                            <td style="font-family: monospace; color: #6b7280;">${biomarker.reference_range}</td>
                            <td>
                                <span class="status-badge" style="background-color: ${getClassificationColor(biomarker.classification)};">
                                    ${biomarker.classification}
                                </span>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Risk Factors -->
            ${riskAssessment.factors.length > 0 ? `
            <div class="section">
                <h2>Risk Factors</h2>
                ${riskAssessment.factors.map(factor => `
                    <div style="margin-bottom: 1rem; padding: 1rem; background: #f9fafb; border-radius: 8px;">
                        <h3 style="margin-bottom: 0.5rem; color: #1f2937;">${factor.name}</h3>
                        <p style="margin-bottom: 0.5rem; color: #6b7280;">${factor.description}</p>
                        <p><strong>Recommendation:</strong> ${factor.recommendation}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Recommendations -->
            <div class="section">
                <h2>Recommendations</h2>
                <ul class="recommendations-list">
                    ${riskAssessment.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>

            <!-- Medical Disclaimer -->
            <div class="section">
                <h2>Important Disclaimer</h2>
                <p style="color: #dc2626; background: #fef2f2; padding: 1rem; border-radius: 8px; border: 1px solid #fecaca;">
                    <strong>Medical Disclaimer:</strong> This report is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for proper medical evaluation and care. The analysis provided is based on automated processing and may not capture all relevant clinical factors.
                </p>
            </div>
        </div>

        <div class="footer">
            <p>Generated by Axo Biomarker Analysis Tool</p>
            <p>Report ID: ${Date.now().toString(36).toUpperCase()}</p>
        </div>
    </div>
</body>
</html>
  `;
}

export function downloadReport(data: ReportData) {
  const htmlContent = generateHTMLReport(data);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `health-report-${data.results.fileName?.replace('.pdf', '') || 'analysis'}-${Date.now()}.html`;
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}