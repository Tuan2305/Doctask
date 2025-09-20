// src/app/models/review.model.ts

export interface ScheduledProgress {
  // Định nghĩa các thuộc tính của scheduledProgresses nếu có
  // Ví dụ:
  // progressId: number;
  // date: string;
  // percentage: number;
  // status: string;
}

export interface UserReviewItem {
  userId: number;
  userName: string;
  scheduledProgresses: ScheduledProgress[];
  // Có thể thêm các thuộc tính khác như Kỳ, Trạng thái, Kết quả, Đề xuất, Phản hồi, File đính kèm
  // nếu API trả về chúng trực tiếp ở đây hoặc bạn cần tính toán chúng
  status?: string; // Ví dụ: 'Đã báo cáo', 'Chưa báo cáo'
  result?: string; // Ví dụ: 'Đạt', 'Chưa đạt'
  proposal?: string;
  feedback?: string;
  attachments?: any[];
}

export interface TaskReviewData {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  items: UserReviewItem[];
}

export interface TaskReviewResponse {
  success: boolean;
  message: string;
  data: TaskReviewData;
  error: any;
}