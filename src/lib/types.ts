export type ReminderType = '1_day_before' | '3_days_before' | '1_hour_before';

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  createdAt: string; // ISO 8601 string format
  completedAt?: string; // ISO 8601 string format
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  tags: string[];
  subtasks: { id: string; text: string; completed: boolean }[];
  reminders?: ReminderType[];
  orderRank?: number;
};

export type TaskWithRisk = Task & {
  riskScore: number;
  riskLevel: 'High' | 'Medium' | 'Low';
};

export type DailyTaskStats = {
  day: string;
  tasks: number;
};

export type PriorityCounts = {
  High: number;
  Medium: number;
  Low: number;
};

export type TaskStats = {
  total: number;
  completedToday: number;
  overdue: number;
  upcoming: number;
  completedThisWeek: number;
  completedLastWeek: number;
  wowTrend: number;
  completionRate: number;
  avgCompletionTimeDays: number;
  mostProductiveDay: string;
  tasksCompletedByDay: DailyTaskStats[];
  priorityCounts: PriorityCounts;
};

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface Schedule {
  id: string;
  courseName: string;
  session: string;
  dayOfWeek: DayOfWeek;
  timeStart: string;
  timeEnd: string;
  location: string;
  lecturer?: string;
}

    