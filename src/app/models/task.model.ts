export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface Task {
  taskId: number;
  title: string;
  description?: string;
  startDate: string | Date;
  dueDate: string | Date;
  percentageComplete?: number;
  progressPercentage?: number; // Thêm alias cho tương thích ngược
  assignerId?: number;
  assigneeId?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  
  // Thêm các trường mới từ API
  frequencyType?: string;
  intervalValue?: number;
  dayOfWeek?: number[];
  daysOfWeek?: number[]; // Alias
  daysOfMonth?: number[];
}

export interface TaskApiResponse {
  success: boolean;
  data: {
    page?: number;
    currentPage?: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    items: Task[];
  };
  message: string;
  error: string | null;
}

export interface TaskDetail {
      taskId: number;
      taskName: string | null;
      description: string;
      assigneeFullNames: string[];
      startDate: string; // ISO string date
      dueDate: string;   // ISO string date
      taskStatus: string; // e.g., "in_progress", "completed"
      progresses: any[]; // Tùy thuộc cấu trúc của progresses
      progressPercentage?: number; // ✅ Thêm thuộc tính này cho thanh tiến độ
  percentageComplete?: number; 
    }