'use client';

import { useState, useEffect, useRef } from 'react';
import FileUpload from '@/components/FileUpload';
import ResultsTable from '@/components/ResultsTable';
import { BiomarkerResult } from '@/types/biomarker';
import { saveBiomarkerResult } from '@/lib/biomarker-history';

export default function Home() {
  const [results, setResults] = useState<BiomarkerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      setResults(data);

      // Save to history for trend tracking
      saveBiomarkerResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewReport = () => {
    setResults(null);
    setError(null);
    setIsLoading(false);
  };

  useEffect(() => {
    if (results && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [results]);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="grain absolute inset-0"></div>

      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm relative z-10">
        <div className="max-w-container mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-ink rounded-sm"></div>
            <span className="text-sm font-medium text-ink">Axo</span>
          </div>
      
        </div>
      </div>

      <div className="max-w-container mx-auto px-8 relative z-10">
        {/* Hero Section */}
        <div className={`transition-all duration-500 ${results ? 'pt-8 pb-8' : 'pt-18 pb-16'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left: Hero content */}
            <div className={`lg:col-span-2 ${results ? 'lg:col-span-3' : ''}`}>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-1 h-1 bg-ink rounded-full"></div>
                <span className="text-xs uppercase tracking-wider text-muted font-medium">
                  CLINICAL EXTRACTION
                </span>
              </div>

              <h1 className={`tracking-tight text-ink mb-6 leading-tight transition-all duration-500 ${
                results ? 'text-3xl' : 'text-5xl'
              }`}>
                Biomarker extraction with{' '}
                <em className="not-italic">precision</em>
              </h1>

              {!results && (
                <p className="text-base text-muted max-w-md">
                  Upload medical reports to automatically extract and analyze biomarker data with
                  reference ranges and classifications.
                </p>
              )}
            </div>

            {/* Right: Stats - Hidden when results are displayed */}
            {!results && (
              <div className="lg:justify-self-end">
                <div className="border border-border bg-white/50 backdrop-blur-sm rounded-xl p-6 min-w-48">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-xs uppercase tracking-wide text-muted">Panels</span>
                      <span className="font-mono text-sm text-ink">847</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-xs uppercase tracking-wide text-muted">Markers</span>
                      <span className="font-mono text-sm text-ink">12.4k</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wide text-muted">Latency</span>
                      <span className="font-mono text-sm text-ink">2.3s</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!results && (
          <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />
        )}

        {error && (
          <div className="max-w-md mx-auto mt-6 p-4 border border-out-of-range/20 bg-out-of-range/5 rounded-lg">
            <p className="text-out-of-range text-sm text-center">{error}</p>
          </div>
        )}

        <div ref={resultsRef}>
          <ResultsTable results={results} onNewReport={handleNewReport} />
        </div>

        {/* Footer */}
        <footer className="pt-16 pb-8">
          <div className="text-center">
            {/* sha256 hash removed */}
          </div>
        </footer>
      </div>
    </div>
  );
}
