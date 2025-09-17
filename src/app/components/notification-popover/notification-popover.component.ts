// src/app/components/notification-popover/notification-popover.component.ts
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { User } from '../../models/user.model';
import { Notification } from '../../models/notification.model';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-notification-popover',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzPopoverModule,
    NzBadgeModule,
    NzListModule,
    NzEmptyModule,
    NzModalModule,
    NzButtonModule,
    NzDividerModule,
    NzAvatarModule
  ],
  templateUrl: './notification-popover.component.html',
  styleUrls: ['./notification-popover.component.scss']
})
export class NotificationPopoverComponent implements OnInit, OnDestroy {
  @Input() currentUser: User | null = null;

  notifications: Notification[] = [];
  unreadNotificationCount = 0;
  isModalVisible = false;

  private notificationSubscription: Subscription | undefined;

  constructor(
    private mockDataService: MockDataService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) {
    this.initializeMockNotifications();
  }

  ngOnInit(): void {
    if (this.currentUser) {
      // Load notifications every 30 seconds
      this.notificationSubscription = interval(30000).pipe(
        startWith(0),
        switchMap(() => this.mockDataService.getNotifications(this.currentUser?.userId))
      ).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.unreadNotificationCount = notifications.filter(n => !n.isRead).length;
        },
        error: (err) => {
          console.error('Failed to load notifications:', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  // Tạo dữ liệu mẫu cho notifications
  private initializeMockNotifications(): void {
    const mockNotifications: Notification[] = [
      {
        notificationId: 1,
        userId: 1,
        message: 'Bạn có 1 nhiệm vụ mới được giao: "Hoàn thiện báo cáo tháng 9"',
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 phút trước
        isRead: false,
        taskId: 101
      },
      {
        notificationId: 2,
        userId: 1,
        message: 'Nhiệm vụ "Phát triển tính năng chat" sắp đến hạn (còn 2 ngày)',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 phút trước
        isRead: false,
        taskId: 102
      },
      {
        notificationId: 3,
        userId: 1,
        message: 'Nguyễn Văn A đã hoàn thành nhiệm vụ "Thiết kế giao diện người dùng"',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước
        isRead: true,
        taskId: 103
      },
      {
        notificationId: 4,
        userId: 1,
        message: 'Có 3 nhiệm vụ cần được duyệt và phê duyệt',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 giờ trước
        isRead: true
      },
      {
        notificationId: 5,
        userId: 1,
        message: 'Trần Thị B yêu cầu gia hạn thời gian cho nhiệm vụ "Kiểm thử hệ thống"',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 giờ trước
        isRead: true,
        taskId: 104
      },
      {
        notificationId: 6,
        userId: 1,
        message: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 ngày trước
        isRead: true
      }
    ];

    // Lưu vào MockDataService
    this.mockDataService.initializeNotifications(mockNotifications);
  }

  openNotificationModal(): void {
    this.isModalVisible = true;
    this.markAllAsRead();
  }

  closeNotificationModal(): void {
    this.isModalVisible = false;
  }

  onNotificationClick(notification: Notification): void {
    if (notification.taskId) {
      this.router.navigate(['/tasks', notification.taskId]);
    }
    this.closeNotificationModal();
  }

  markAllAsRead(): void {
    if (this.currentUser) {
      const unreadIds = this.notifications.filter(n => !n.isRead).map(n => n.notificationId);
      
      if (unreadIds.length > 0) {
        Promise.all(unreadIds.map(id => 
          this.mockDataService.markNotificationAsRead(id).toPromise()
        )).then(() => {
          this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
          this.unreadNotificationCount = 0;
        }).catch(err => {
          console.error('Failed to mark notifications as read:', err);
        });
      }
    }
  }

  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation(); // Prevent opening notification modal
    
    this.mockDataService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.notificationId !== notificationId);
        this.unreadNotificationCount = this.notifications.filter(n => !n.isRead).length;
        this.message.success('Đã xóa thông báo');
      },
      error: (err) => {
        console.error('Failed to delete notification:', err);
        this.message.error('Không thể xóa thông báo');
      }
    });
  }

  markAsRead(notificationId: number, event: Event): void {
    event.stopPropagation();
    
    this.mockDataService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.notificationId === notificationId);
        if (notification) {
          notification.isRead = true;
          this.unreadNotificationCount = this.notifications.filter(n => !n.isRead).length;
        }
      },
      error: (err) => {
        console.error('Failed to mark notification as read:', err);
      }
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return new Date(date).toLocaleDateString('vi-VN');
  }
}