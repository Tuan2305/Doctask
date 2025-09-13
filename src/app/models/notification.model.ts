export interface Notification {
  notificationId: number;
  userId?: number; // Người nhận thông báo
  message: string;
  createdAt: Date;
  isRead: boolean;
 
  taskId?: number;
}