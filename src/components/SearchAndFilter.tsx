'use client';

import { useState } from 'react';
import { Biomarker } from '@/types/biomarker';

interface SearchAndFilterProps {
  biomarkers: Biomarker[];
  onFilterChange: (filteredBiomarkers: Biomarker[], searchTerm: string) => void;
}

export default function SearchAndFilter({ biomarkers, onFilterChange }: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassifications, setSelectedClassifications] = useState<Set<string>>(new Set(['optimal', 'normal', 'out of range']));

  const applyFilters = (search: string, classifications: Set<string>) => {
    let filtered = biomarkers;

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(biomarker =>
        biomarker.name.toLowerCase().includes(searchLower) ||
        biomarker.value.toLowerCase().includes(searchLower) ||
        biomarker.unit.toLowerCase().includes(searchLower)
      );
    }

    // Filter by classification
    if (classifications.size > 0) {
      filtered = filtered.filter(biomarker =>
        classifications.has(biomarker.classification)
      );
    }

    onFilterChange(filtered, search);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, selectedClassifications);
  };

  const toggleClassification = (classification: string) => {
    const newClassifications = new Set(selectedClassifications);
    if (newClassifications.has(classification)) {
      newClassifications.delete(classification);
    } else {
      newClassifications.add(classification);
    }
    setSelectedClassifications(newClassifications);
    applyFilters(searchTerm, newClassifications);
  };

  const clearAll = () => {
    setSearchTerm('');
    setSelectedClassifications(new Set(['optimal', 'normal', 'out of range']));
    onFilterChange(biomarkers, '');
  };

  const getFilterCount = () => {
    let filtered = biomarkers;
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(biomarker =>
        biomarker.name.toLowerCase().includes(searchLower) ||
        biomarker.value.toLowerCase().includes(searchLower) ||
        biomarker.unit.toLowerCase().includes(searchLower)
      );
    }
    if (selectedClassifications.size > 0) {
      filtered = filtered.filter(biomarker =>
        selectedClassifications.has(biomarker.classification)
      );
    }
    return filtered.length;
  };

  if (biomarkers.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search biomarkers, values, or units..."
          className="block w-full pl-10 pr-12 py-2 border border-border rounded-lg bg-white text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-4 w-4 text-muted hover:text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Buttons and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-muted uppercase tracking-wider">Filter by status:</span>

          {['optimal', 'normal', 'out of range'].map(classification => {
            const count = biomarkers.filter(b => b.classification === classification).length;
            const isActive = selectedClassifications.has(classification);

            return (
              <button
                key={classification}
                onClick={() => toggleClassification(classification)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? classification === 'optimal'
                      ? 'bg-green-500 text-white'
                      : classification === 'normal'
                      ? 'bg-amber-400 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {classification} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-muted">
            Showing {getFilterCount()} of {biomarkers.length} biomarkers
          </span>

          {(searchTerm || selectedClassifications.size < 3) && (
            <button
              onClick={clearAll}
              className="text-xs text-ink hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}