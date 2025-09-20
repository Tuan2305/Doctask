// src/app/pages/task-review/task-review.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskApiService } from '../../services/task.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserReviewItem } from '../../models/review.model';
import { differenceInDays, addDays } from 'date-fns'; // Để xử lý ngày tháng

@Component({
  selector: 'app-task-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSpinModule,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTableModule,
    NzCheckboxModule,
    NzPaginationModule,
    // NzMessageService // NzMessageService không cần import vào imports, nó là một service
  ],
  templateUrl: './task-review.component.html',
  styleUrls: ['./task-review.component.scss']
})
export class TaskReviewComponent implements OnInit {
  taskId: number | null = null;
  taskTitle: string = 'Rà soát công việc'; // Tiêu đề mặc định

  // Filter properties
  reviewObjects: any[] = [{ label: 'Tất cả', value: 'all' }]; // Đối tượng rà soát (placeholder)
  selectedReviewObject: string = 'all';
  dateRange: [Date | null, Date | null] = [null, null];
  defaultStartDate: Date = addDays(new Date(), -7); // Mặc định 7 ngày trước
  defaultEndDate: Date = new Date(); // Mặc định hôm nay

  // Table data
  listOfData: UserReviewItem[] = [];
  loading = false;
  errorMessage: string | null = null;

  // Pagination
  pageIndex = 1;
  pageSize = 10;
  total =   0;

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
        // Lấy taskTitle nếu có truyền từ TaskDetailComponent
        const state = this.router.getCurrentNavigation()?.extras.state;
        if (state && state['taskTitle']) {
          this.taskTitle = `Rà soát công việc: ${state['taskTitle']}`;
        }
        this.initializeDateRange();
        this.loadReviewData();
      } else {
        this.errorMessage = 'Không tìm thấy ID công việc để rà soát.';
        this.message.error(this.errorMessage);
      }
    });
  }

  initializeDateRange(): void {
    this.dateRange = [this.defaultStartDate, this.defaultEndDate];
  }

  loadReviewData(): void {
    if (this.taskId === null || !this.dateRange[0] || !this.dateRange[1]) {
      this.message.warning('Vui lòng chọn đầy đủ thời gian rà soát.');
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    // Chuyển đổi Date sang ISO string
    const startDateISO = this.dateRange[0]!.toISOString();
    const endDateISO = this.dateRange[1]!.toISOString();

    this.taskApiService.getTaskReviewFrequency(
      this.taskId,
      startDateISO,
      endDateISO,
      this.pageIndex,
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.listOfData = response.data.items;
          this.total = response.data.totalItems;
          this.message.success(response.message);
        } else {
          this.errorMessage = response.message || 'Không thể tải dữ liệu rà soát.';
          this.message.error(this.errorMessage);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu rà soát:', err);
        this.errorMessage = 'Đã xảy ra lỗi khi kết nối máy chủ.';
        this.message.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  onDateRangeChange(result: [Date | null, Date | null]): void {
    this.dateRange = result;
  }

  onReview(): void {
    this.pageIndex = 1; // Reset page khi thực hiện rà soát mới
    this.loadReviewData();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadReviewData();
  }

  goBack(): void {
    // Nếu muốn quay lại trang chi tiết task
    if (this.taskId) {
      this.router.navigate(['/task-detail', this.taskId]);
    } else {
      // Hoặc quay lại trang quản lý task nếu không có taskId
      this.router.navigate(['/task-management']);
    }
  }

  remindUser(userId: number): void {
    this.message.info(`Đang nhắc nhở người dùng có ID: ${userId}`);
    // Thực hiện gọi API nhắc nhở tại đây
  }

  summarizeReport(): void {
    this.message.info('Đang tổng hợp báo cáo...');
    // Thực hiện logic tổng hợp báo cáo
  }


  disabledStartDate = (startValue: Date): boolean => {
  if (!startValue || !this.dateRange[1]) {
    return false;
  }
  return startValue.getTime() >= this.dateRange[1].getTime();
};
  // Disable end date selection if it's before start date
  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue || !this.dateRange[0]) {
      return false;
    }
    return endValue.getTime() <= this.dateRange[0].getTime();
  };


  // Disable start date selection if it's after end date
  disabledDate = (date: Date): boolean => {
  return this.disabledStartDate(date) || this.disabledEndDate(date);
};
}                                       