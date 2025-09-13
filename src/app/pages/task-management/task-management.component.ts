// src/app/pages/task-management/task-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskFormModalComponent } from '../../components/task-form-modal/task-form-modal.component';
import { ProgressModalComponent } from '../../components/progress-modal/progress-modal.component';
// import { TaskAssignmentModalComponent } from '../../components/task-assignment-modal/task-assignment-modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { User } from '../../models/user.model';
import { forkJoin, map, of, Observable, catchError } from 'rxjs';
import { TaskApiService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzProgressModule,
    NzInputModule,
    NzEmptyModule,
    NzPaginationModule,
    NzTagModule,
    NzSpinModule
  ],
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss']
})
export class TaskManagementComponent implements OnInit {
  listOfTasks: Task[] = [];
  displayTasks: Task[] = [];
  searchText = '';
  loading = false;
  pageSize = 10;
  pageIndex = 1;
  total = 0;
  currentUser: User | null = null;
  pageTitle: string = 'Các công việc quản lý';

  constructor(
    private taskApiService: TaskApiService,
    private modal: NzModalService,
    private message: NzMessageService,
    private authService: AuthService
  ) {
    this.displayTasks = [];
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser) {
        this.loadTasks();
      } else {
        this.displayTasks = [];
        this.listOfTasks = [];
        this.total = 0;
      }
    });
  }

  loadTasks(): void {
    this.loading = true;
    
    this.taskApiService.getTasksByAssigner(this.pageIndex, this.pageSize, this.searchText)
      .pipe(
        catchError(error => {
          this.message.error('Không thể tải danh sách nhiệm vụ.');
          this.loading = false;
          console.error('Error loading tasks:', error);
          return of({ items: [], totalCount: 0, page: 1, pageSize: 10 });
        })
      )
      .subscribe(response => {
        this.listOfTasks = response.items || [];
        this.total = response.totalCount || 0;
        this.displayTasks = this.listOfTasks;
        this.loading = false;
      });
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadTasks();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadTasks();
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadTasks();
  }

  // Sửa: Xóa nzTitle vì không được hỗ trợ trong NG-ZORRO-ANTD
  // openTaskAssignmentModal(task?: Task): void {
  //   const isParentTask = !task;
  //   const modalRef = this.modal.create({
  //     nzContent: TaskAssignmentModalComponent,
  //     nzWidth: 700,
  //     nzData: {
  //       parentTask: task || null,
  //       isChildTask: !isParentTask
  //     },
  //     nzFooter: null
  //   });

  //   modalRef.afterClose.subscribe(result => {
  //     if (result) {
  //       this.message.success(isParentTask ? 'Tạo nhiệm vụ thành công!' : 'Phân công nhiệm vụ thành công!');
  //       this.loadTasks();
  //     }
  //   });
  // }

  // // Sửa: Xóa nzTitle
  // openTaskFormModal(task?: Task): void {
  //   const isEdit = !!task;
  //   const modalRef = this.modal.create({
  //     nzContent: TaskFormModalComponent,
  //     nzWidth: 600,
  //     nzData: {
  //       task: task || null,
  //       assignerId: this.currentUser?.userId
  //     },
  //     nzFooter: null
  //   });

  //   modalRef.afterClose.subscribe(result => {
  //     if (result) {
  //       this.message.success(isEdit ? 'Cập nhật nhiệm vụ thành công!' : 'Thêm nhiệm vụ thành công!');
  //       this.loadTasks();
  //     }
  //   });
  // }

  // // Sửa: Xóa nzTitle
  // openProgressModal(task: Task): void {
  //   const modalRef = this.modal.create({
  //     nzContent: ProgressModalComponent,
  //     nzWidth: 500,
  //     nzData: {
  //       taskId: task.taskId,
  //       currentProgress: task.progressPercentage || 0,
  //       currentStatus: task.status
  //     },
  //     nzFooter: null
  //   });

  //   modalRef.afterClose.subscribe(result => {
  //     if (result) {
  //       this.message.success('Cập nhật tiến độ thành công!');
  //       this.loadTasks();
  //     }
  //   });
  // }
  
  // addSubtask(parentTask: Task): void {
  //   this.openTaskAssignmentModal(parentTask);
  // }

  getProgressColor(progress: number): string {
    if (progress >= 75) return '#52c41a';
    if (progress >= 50) return '#1890ff'; 
    if (progress >= 25) return '#faad14';
    return '#f5222d';
  }
}