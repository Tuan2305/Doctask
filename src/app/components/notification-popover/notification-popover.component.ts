import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { User } from '../../models/user.model';
import { Notification } from '../../models/notification.model';
import { interval, Subscription } from 'rxjs'; // Thêm Subscription
import { startWith, switchMap } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message'; // Có thể dùng cho thông báo lỗi

@Component({
  selector: 'app-notification-popover',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzPopoverModule,
    NzBadgeModule,
    NzListModule,
    NzEmptyModule
  ],
  templateUrl: './notification-popover.component.html',
  styleUrls: ['./notification-popover.component.scss']
})
export class NotificationPopoverComponent implements OnInit, OnDestroy {
  @Input() currentUser: User | null = null; // Nhận thông tin người dùng từ HeaderComponent

  notifications: Notification[] = [];
  unreadNotificationCount = 0;
  isPopoverVisible = false; // Sử dụng tên khác để tránh nhầm lẫn với header

  private notificationSubscription: Subscription | undefined;

  constructor(
    private mockDataService: MockDataService,
    private router: Router,
    private message: NzMessageService // Dùng để hiển thị message nếu cần
  ) {}

  ngOnInit(): void {
    if (this.currentUser) {
      // Cập nhật thông báo định kỳ (ví dụ mỗi 30 giây)
      this.notificationSubscription = interval(30000).pipe(
        startWith(0), // Chạy ngay lập tức khi component khởi tạo
        switchMap(() => this.mockDataService.getNotifications(this.currentUser?.userId))
      ).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.unreadNotificationCount = notifications.filter(n => !n.isRead).length;
        },
        error: (err) => {
          console.error('Failed to load notifications:', err);
          this.message.error('Không thể tải thông báo!');
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Đảm bảo hủy subscription khi component bị hủy để tránh memory leaks
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  onPopoverVisibleChange(visible: boolean): void {
    this.isPopoverVisible = visible;
    if (visible && this.currentUser && this.unreadNotificationCount > 0) {
      // Đánh dấu tất cả thông báo chưa đọc là đã đọc khi popover được mở
      const unreadIds = this.notifications.filter(n => !n.isRead).map(n => n.notificationId);
      const markAsReadObservables = unreadIds.map(id => this.mockDataService.markNotificationAsRead(id));

      if (markAsReadObservables.length > 0) {
        Promise.all(markAsReadObservables.map(obs => obs.toPromise()))
          .then(() => {
            // Sau khi đánh dấu là đã đọc, cập nhật lại danh sách và số lượng
            this.mockDataService.getNotifications(this.currentUser?.userId).subscribe(updatedNotifications => {
              this.notifications = updatedNotifications;
              this.unreadNotificationCount = updatedNotifications.filter(n => !n.isRead).length;
            });
          })
          .catch(err => {
            console.error('Failed to mark notifications as read:', err);
            this.message.error('Đã xảy ra lỗi khi đánh dấu thông báo đã đọc.');
          });
      }
    }
  }

  onNotificationClick(notification: Notification): void {
    if (notification.taskId) {
      this.router.navigate(['/tasks', notification.taskId]);
    }
    this.isPopoverVisible = false; // Đóng popover sau khi click
  }
}