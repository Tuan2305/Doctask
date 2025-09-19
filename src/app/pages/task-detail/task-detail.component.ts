// src/app/pages/task-detail/task-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskApiService } from '../../services/task.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TaskDetail } from '../../models/task.model';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTagModule } from 'ng-zorro-antd/tag'

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSpinModule,
    NzIconModule,
    NzButtonModule,
    NzEmptyModule,
    NzInputModule,
    NzProgressModule,
    NzPaginationModule,
    NzTagModule,
    DatePipe
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  taskId: number | null = null;
  taskDetail: TaskDetail | null = null;
  loading = false;
  errorMessage: string | null = null;
  searchText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskApiService: TaskApiService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.taskId = +id;
        this.loadTaskDetail();
      } else {
        this.errorMessage = 'Không tìm thấy ID công việc.';
        this.message.error(this.errorMessage);
      }
    });
  }

  loadTaskDetail(): void {
    if (this.taskId === null) return;

    this.loading = true;
    this.errorMessage = null;
    this.taskApiService.getTaskDetailById(this.taskId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Khởi tạo một biến cục bộ với kiểu TaskDetail để TypeScript biết nó không null
          let tempTaskDetail: TaskDetail = {
            ...response.data,
            progressPercentage: this.calculateProgressFromAPI(response.data.progresses)
          };

          // Sửa lỗi TS2531: Object is possibly 'null'
          // Làm việc trên tempTaskDetail, sau đó gán vào this.taskDetail
          if (!tempTaskDetail.taskName && tempTaskDetail.description) {
            tempTaskDetail.taskName = tempTaskDetail.description.substring(0, 50) + '...';
          }
          this.taskDetail = tempTaskDetail; // Gán giá trị cuối cùng vào taskDetail của component

        } else {
          this.errorMessage = response.message || 'Không thể tải chi tiết công việc.';
          // Sửa lỗi TS2345: Argument of type 'string | null' is not assignable
          this.message.error(this.errorMessage ?? 'Không thể tải chi tiết công việc.'); // Sử dụng ?? để cung cấp giá trị mặc định
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải chi tiết công việc:', err);
        this.errorMessage = 'Đã xảy ra lỗi khi kết nối máy chủ.';
        // Sửa lỗi TS2345: Argument of type 'string | null' is not assignable
        this.message.error(this.errorMessage ?? 'Đã xảy ra lỗi khi kết nối máy chủ.'); // Sử dụng ?? để cung cấp giá trị mặc định
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    console.log('Tìm kiếm trong chi tiết công việc:', this.searchText);
  }

  goBack(): void {
    this.router.navigate(['/task-management']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'delayed': return 'red';
      case 'pending':
      default: return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in_progress': return 'Đang thực hiện';
      case 'delayed': return 'Trì hoãn';
      case 'pending':
      default: return 'Chờ xử lý';
    }
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return '#52c41a';
    if (progress >= 50) return '#1890ff';
    if (progress >= 25) return '#faad14';
    return '#f5222d';
  }

  private calculateProgressFromAPI(progresses: any[]): number {
    if (!progresses || progresses.length === 0) {
      return 0;
    }
    // Logic tính toán tiến độ giả định, bạn có thể điều chỉnh
    const totalPercentage = progresses.reduce((sum: number, p: any) => sum + (p.percentage || 0), 0);
    return Math.round(totalPercentage / progresses.length);
  }
}