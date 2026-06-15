import { BiomarkerGoal, GoalProgress } from '@/types/goals';
import { getBiomarkerTrend } from './biomarker-history';

const GOALS_STORAGE_KEY = 'biomarker-goals';

export function saveGoal(goal: BiomarkerGoal): void {
  try {
    const goals = getGoals();
    const existingIndex = goals.findIndex(g => g.id === goal.id);

    if (existingIndex >= 0) {
      goals[existingIndex] = goal;
    } else {
      goals.push(goal);
    }

    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goal:', error);
  }
}

export function getGoals(): BiomarkerGoal[] {
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading goals:', error);
    return [];
  }
}

export function deleteGoal(goalId: string): void {
  try {
    const goals = getGoals().filter(g => g.id !== goalId);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error deleting goal:', error);
  }
}

export function calculateGoalProgress(goal: BiomarkerGoal): GoalProgress {
  const biomarkerHistory = getBiomarkerTrend(goal.biomarkerName);

  // Get latest value
  const latestEntry = biomarkerHistory?.entries
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  const currentValue = latestEntry?.value || goal.currentValue || 0;
  const targetValue = goal.targetValue;

  // Calculate progress based on direction
  let progress = 0;
  if (goal.direction === 'decrease') {
    // For decreasing goals (e.g., cholesterol), progress is how much we've decreased
    const initialValue = goal.currentValue || currentValue;
    if (initialValue > targetValue) {
      const totalNeeded = initialValue - targetValue;
      const achieved = initialValue - currentValue;
      progress = Math.max(0, Math.min(100, (achieved / totalNeeded) * 100));
    } else {
      progress = 100; // Already at or below target
    }
  } else {
    // For increasing goals (e.g., vitamin D), progress is how much we've increased
    const initialValue = goal.currentValue || currentValue;
    if (initialValue < targetValue) {
      const totalNeeded = targetValue - initialValue;
      const achieved = currentValue - initialValue;
      progress = Math.max(0, Math.min(100, (achieved / totalNeeded) * 100));
    } else {
      progress = 100; // Already at or above target
    }
  }

  // Check if completed
  const isCompleted = goal.direction === 'decrease'
    ? currentValue <= targetValue
    : currentValue >= targetValue;

  // Calculate days remaining
  const targetDate = new Date(goal.targetDate);
  const today = new Date();
  const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Determine trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (biomarkerHistory && biomarkerHistory.entries.length >= 2) {
    const sorted = biomarkerHistory.entries.sort((a, b) => a.timestamp - b.timestamp);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    if (goal.direction === 'decrease') {
      trend = last.value < first.value ? 'improving' :
             last.value > first.value ? 'declining' : 'stable';
    } else {
      trend = last.value > first.value ? 'improving' :
             last.value < first.value ? 'declining' : 'stable';
    }
  }

  return {
    goal,
    progress,
    isCompleted,
    daysRemaining,
    trend,
    lastValue: currentValue,
    lastUpdated: latestEntry?.timestamp
  };
}

export function createGoal(
  biomarkerName: string,
  targetValue: number,
  targetDate: string,
  direction: 'increase' | 'decrease',
  priority: 'low' | 'medium' | 'high',
  currentValue?: number,
  unit?: string,
  notes?: string
): BiomarkerGoal {
  return {
    id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    biomarkerName,
    targetValue,
    targetDate,
    currentValue,
    unit: unit || '',
    direction,
    priority,
    notes,
    createdAt: Date.now()
  };
}

export function getGoalProgressList(): GoalProgress[] {
  const goals = getGoals();
  return goals.map(goal => calculateGoalProgress(goal));
}