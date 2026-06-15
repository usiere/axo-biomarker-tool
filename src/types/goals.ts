export interface BiomarkerGoal {
  id: string;
  biomarkerName: string;
  targetValue: number;
  targetDate: string;
  currentValue?: number;
  unit: string;
  direction: 'increase' | 'decrease';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: number;
}

export interface GoalProgress {
  goal: BiomarkerGoal;
  progress: number; // 0-100 percentage
  isCompleted: boolean;
  daysRemaining: number;
  trend: 'improving' | 'stable' | 'declining';
  lastValue?: number;
  lastUpdated?: number;
}