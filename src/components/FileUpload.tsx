'use client';

import { useState, useEffect } from 'react';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.[0] && files[0].type === 'application/pdf') {
      onUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0] && files[0].type === 'application/pdf') {
      onUpload(files[0]);
    }
  };

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Reading PDF' },
    { label: 'Extracting text' },
    { label: 'Identifying biomarkers' },
    { label: 'Normalising against reference ranges' },
    { label: 'Classifying' },
  ];

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    // Animate through steps with realistic timing
    const timings = [500, 800, 1200, 1000, 800]; // ms for each step
    let totalTime = 0;
    const timeouts: NodeJS.Timeout[] = [];

    // Reset to first step immediately in a timeout to avoid sync setState
    const resetTimeout = setTimeout(() => {
      setCurrentStep(0);
    }, 0);
    timeouts.push(resetTimeout);

    timings.forEach((duration, index) => {
      if (index < steps.length - 1) {
        totalTime += duration;
        const timeout = setTimeout(() => {
          setCurrentStep(index + 1);
        }, totalTime);
        timeouts.push(timeout);
      }
    });

    // Cleanup function to clear timeouts if component unmounts or effect re-runs
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isLoading, steps.length]);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto mb-16">
        <div className="border border-border bg-white/50 backdrop-blur-sm rounded-xl p-8 relative overflow-hidden animate-fade-up">
          {/* Shimmer bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-border overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ink/20 to-transparent animate-shimmer"></div>
          </div>

          {/* Processing steps */}
          <div className="space-y-5 pt-2">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;

              return (
                <div key={index} className={`flex items-center space-x-3 transition-all duration-500 ${
                  isCompleted ? 'opacity-45' : 'opacity-100'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-optimal transition-all duration-300" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-ink animate-spin" />
                  ) : (
                    <div className="w-[6px] h-[6px] bg-border rounded-full"></div>
                  )}
                  <span className={`text-sm transition-colors duration-300 ${
                    isActive ? 'text-ink font-medium' : 'text-ink'
                  }`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mb-16">
      <div
        className={`border border-border bg-white rounded-xl p-8 text-center transition-colors cursor-pointer hover:border-ink ${
          dragActive ? 'border-ink bg-hover' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          disabled={isLoading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center space-y-4"
        >
          <Upload className="w-8 h-8 text-muted" />

          <div className="space-y-1">
            <h3 className="text-base font-medium text-ink">Upload a report</h3>
            <p className="text-sm text-muted">
              Drag and drop or click to select your medical report
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs uppercase tracking-wider text-muted">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-optimal rounded-full"></div>
              <span>PDF</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-optimal rounded-full"></div>
              <span>Up to 20MB</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-optimal rounded-full"></div>
              <span>Processed locally</span>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}