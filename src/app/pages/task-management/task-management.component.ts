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
  displayTasks: Task[] = []; // ✅ Sửa: khai báo đúng property displayTasks
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

  getProgressColor(progress: number): string {
    if (progress >= 75) return '#52c41a';
    if (progress >= 50) return '#1890ff'; 
    if (progress >= 25) return '#faad14';
    return '#f5222d';
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'delayed': return 'red';
      case 'pending': 
      default: return 'default';
    }
  }

  getStatusText(status: TaskStatus): string {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in_progress': return 'Đang thực hiện';
      case 'delayed': return 'Trì hoãn';
      case 'pending': 
      default: return 'Chờ xử lý';
    }
  }

  // ✅ Sửa: tạo method updateDisplayTasks đúng cách
  private updateDisplayTasks(): void {
    let filteredTasks = this.listOfTasks;

    // Filter by search text if needed
    if (this.searchText) {
      filteredTasks = this.listOfTasks.filter(task =>
        task.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(this.searchText.toLowerCase()))
      );
    }

    // Update displayTasks
    this.displayTasks = filteredTasks;
    this.total = filteredTasks.length;
  }

  async openEditTaskModal(task: Task): Promise<void> {
    try {
      // Dynamic import EditParentTaskModalComponent
      const { EditParentTaskModalComponent } = await import('../../components/edit-parent-task-modal/edit-parent-task-modal.component');
      
      const modalRef = this.modal.create({
        nzContent: EditParentTaskModalComponent,
        nzWidth: 700,
        nzData: {
          task: task
        },
        nzFooter: null,
        nzMaskClosable: false,
        nzClosable: false
      });

      modalRef.afterClose.subscribe(result => {
        if (result && result.success) {
          this.message.success('Cập nhật công việc thành công!');
          
          // Cập nhật task trong danh sách local
          const taskIndex = this.listOfTasks.findIndex(t => t.taskId === task.taskId);
          if (taskIndex !== -1) {
            this.listOfTasks[taskIndex] = {
              ...this.listOfTasks[taskIndex],
              title: result.data.title,
              description: result.data.description,
              startDate: result.data.startDate,
              dueDate: result.data.dueDate,
              updatedAt: new Date()
            };

            // ✅ Sửa: gọi method updateDisplayTasks() đúng cách
            this.updateDisplayTasks();
          }
          
          // Reload để đảm bảo đồng bộ với server
          setTimeout(() => {
            this.loadTasks();
          }, 500);
        }
      });
    } catch (error) {
      console.error('❌ Error loading EditParentTaskModal:', error);
      this.message.error('Không thể mở modal sửa công việc');
    }
  }

  // ✅ Thêm: Method để mở modal thêm subtask
  async openAddSubtaskModal(parentTask: Task): Promise<void> {
    try {
      const { TaskAssignmentModalComponent } = await import('../../components/task-assignment-modal/task-assignment-modal');
      
      const modalRef = this.modal.create({
        nzContent: TaskAssignmentModalComponent,
        nzWidth: 700,
        nzData: {
          parentTask: parentTask,
          isChildTask: true
        },
        nzFooter: null,
        nzMaskClosable: false
      });

      modalRef.afterClose.subscribe(result => {
        if (result) {
          this.message.success('Thêm việc con thành công!');
          this.loadTasks();
        }
      });
    } catch (error) {
      console.error('Error loading TaskAssignmentModal:', error);
      this.message.error('Không thể mở modal thêm việc con');
    }
  }

  // ✅ Thêm: Method để mở modal tiến độ
  openProgressModal(task: Task): void {
    const modalRef = this.modal.create({
      nzContent: ProgressModalComponent,
      nzWidth: 500,
      nzData: {
        taskId: task.taskId,
        currentProgress: task.progressPercentage || task.percentageComplete || 0,
        currentStatus: task.status || 'pending'
      },
      nzFooter: null
    });

    modalRef.afterClose.subscribe(result => {
      if (result) {
        this.message.success('Cập nhật tiến độ thành công!');
        this.loadTasks();
      }
    });
  }
}
