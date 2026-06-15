'use client';

import { useState } from 'react';
import { getGoalProgressList, saveGoal, deleteGoal, createGoal } from '@/lib/goal-tracker';
import { getBiomarkerHistory } from '@/lib/biomarker-history';
import { GoalProgress } from '@/types/goals';

const AddGoalForm = ({ availableBiomarkers, onSave, onCancel }: {
  availableBiomarkers: string[];
  onSave: () => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    biomarkerName: '',
    targetValue: '',
    targetDate: '',
    direction: 'decrease' as 'increase' | 'decrease',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.biomarkerName || !formData.targetValue || !formData.targetDate) {
      return;
    }

    const goal = createGoal(
      formData.biomarkerName,
      parseFloat(formData.targetValue),
      formData.targetDate,
      formData.direction,
      formData.priority,
      undefined,
      '',
      formData.notes
    );

    saveGoal(goal);
    onSave();
    setFormData({
      biomarkerName: '',
      targetValue: '',
      targetDate: '',
      direction: 'decrease',
      priority: 'medium',
      notes: ''
    });
  };

  return (
    <div className="border border-border bg-white/50 backdrop-blur-sm rounded-lg p-4">
      <h4 className="font-medium text-ink mb-3">Set New Goal</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Biomarker</label>
            <select
              value={formData.biomarkerName}
              onChange={(e) => setFormData({...formData, biomarkerName: e.target.value})}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select biomarker...</option>
              {availableBiomarkers.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Target Value</label>
            <input
              type="number"
              step="0.01"
              value={formData.targetValue}
              onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Target Date</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Direction</label>
            <select
              value={formData.direction}
              onChange={(e) => setFormData({...formData, direction: e.target.value as 'increase' | 'decrease'})}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="decrease">Decrease (Lower is better)</option>
              <option value="increase">Increase (Higher is better)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="e.g., Doctor recommended..."
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Save Goal
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-600 text-gray-600 px-4 py-2 text-sm rounded hover:bg-gray-600 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default function GoalTracker() {
  const [goals, setGoals] = useState<GoalProgress[]>(() => getGoalProgressList());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTracker, setShowTracker] = useState(false);

  const availableBiomarkers = getBiomarkerHistory().map(h => h.biomarkerName);

  const refreshGoals = () => {
    setGoals(getGoalProgressList());
  };


  if (availableBiomarkers.length === 0) {
    return (
      <div className="border border-border bg-white/50 backdrop-blur-sm rounded-lg p-6 text-center">
        <p className="text-muted">Upload biomarker reports to start tracking health goals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🎯</span>
          <h3 className="text-lg font-semibold text-ink">Goal Tracking</h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTracker(!showTracker)}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              showTracker
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {showTracker ? 'Hide Goals' : 'View Goals'}
          </button>

          {showTracker && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Add Goal
            </button>
          )}
        </div>
      </div>

      {showTracker && (
        <>
          {/* Add Goal Form */}
          {showAddForm && (
            <AddGoalForm
              availableBiomarkers={availableBiomarkers}
              onSave={() => {
                refreshGoals();
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Goals List */}
          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map(goalProgress => (
                <div key={goalProgress.goal.id} className="border border-border bg-white/50 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-ink">{goalProgress.goal.biomarkerName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goalProgress.goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                        goalProgress.goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {goalProgress.goal.priority} priority
                      </span>
                      {goalProgress.isCompleted && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        deleteGoal(goalProgress.goal.id);
                        refreshGoals();
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted">Current → Target</div>
                      <div className="font-mono text-sm text-ink">
                        {goalProgress.lastValue?.toFixed(2) || 'N/A'} → {goalProgress.goal.targetValue}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted">Progress</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              goalProgress.progress >= 100 ? 'bg-green-500' :
                              goalProgress.progress >= 70 ? 'bg-blue-500' :
                              goalProgress.progress >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min(goalProgress.progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-ink">
                          {Math.round(goalProgress.progress)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted">Days Remaining</div>
                      <div className={`text-sm font-medium ${
                        goalProgress.daysRemaining < 0 ? 'text-red-600' :
                        goalProgress.daysRemaining < 30 ? 'text-yellow-600' : 'text-ink'
                      }`}>
                        {goalProgress.daysRemaining < 0 ? 'Overdue' : `${goalProgress.daysRemaining} days`}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted">Trend</div>
                      <span className={`text-sm font-medium ${
                        goalProgress.trend === 'improving' ? 'text-green-600' :
                        goalProgress.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {goalProgress.trend === 'improving' ? '↗ Improving' :
                         goalProgress.trend === 'declining' ? '↘ Declining' : '→ Stable'}
                      </span>
                    </div>
                  </div>

                  {goalProgress.goal.notes && (
                    <div className="text-sm text-muted bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {goalProgress.goal.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : !showAddForm && (
            <div className="border border-border bg-white/50 backdrop-blur-sm rounded-lg p-6 text-center">
              <p className="text-muted mb-3">No goals set yet. Start tracking your health progress!</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Set Your First Goal
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}