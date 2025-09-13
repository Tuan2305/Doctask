import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
// import { NotificationModule } from '../../components/notification-popover/notification.module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
   CommonModule, 
    RouterModule,
    NzButtonModule, 
    NzIconModule, 
    NzBadgeModule, 
    NzAvatarModule,
    NzPopoverModule,
    NzMenuModule,
 
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() currentUser: User | null = null;
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() sidebarToggle = new EventEmitter<boolean>();
  isUserPopoverVisible = false;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Đăng ký lắng nghe thay đổi thông tin người dùng từ AuthService
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
  
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.isUserPopoverVisible = false; // Đóng popover sau khi điều hướng
  }
  
  logout(): void {
    this.authService.logout();
    this.logoutEvent.emit();
    this.router.navigate(['/login']);
    this.isUserPopoverVisible = false;
  }
  
  toggleUserPopover(): void {
    this.isUserPopoverVisible = !this.isUserPopoverVisible;
  }
  
  changePassword(): void {
    // Sẽ được triển khai sau
    this.navigateTo('/change-password');
  }

  toggleSidebar() {
  this.sidebarToggle.emit(true); // hoặc false tùy trạng thái
}
navigateToTaskAssignment(): void {
  this.router.navigate(['/task-assignment']);
}
}
