export interface Progress {
  progressId: number;
  taskId: number; // FK to Task
  periodId?: number; // FK to Period
  percentageComplete: number;
  comment?: string;
  proposal?: string;
  result?: string;
  feedback?: string;
  status: string; // 'not_started' | 'in_progress' | 'completed' | ...
  updatedBy?: number; // FK to User
  updatedAt: Date;
  fileName?: string;
  filePath?: string;
}