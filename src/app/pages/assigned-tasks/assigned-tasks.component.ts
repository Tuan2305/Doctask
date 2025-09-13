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
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Task, TaskStatus } from '../../models/task.model';
import { MockDataService, TaskFilterOptions } from '../../services/mock-data.service';
import { TaskFormModalComponent } from '../../components/task-form-modal/task-form-modal.component';
import { ProgressModalComponent } from '../../components/progress-modal/progress-modal.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { User } from '../../models/user.model';
import { forkJoin, map, of, Observable, catchError } from 'rxjs';
import { TaskApiService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-assigned-tasks',
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
    NzSpinModule
  ],
  templateUrl: './assigned-tasks.component.html',
  styleUrls: ['./assigned-tasks.component.scss']
})
export class AssignedTasksComponent implements OnInit {
  listOfTasks: Task[] = [];
  displayTasks: Task[] = [];
  searchText = '';
  loading = false;
  pageSize = 10;
  pageIndex = 1;
  total = 0;
  currentUser: User | null = null;
  pageTitle: string = 'Các công việc được giao';
  showAlert: boolean = false;
  hoveredTask: Task | null = null; // Thêm property để track task đang hover

  constructor(
    private taskApiService: TaskApiService,
    private mockDataService: MockDataService,
    private modal: NzModalService,
    private message: NzMessageService,
    private authService: AuthService
  ) {}

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
    
    this.taskApiService.getTasksByAssignee(this.pageIndex, this.pageSize, this.searchText)
      .pipe(
        catchError(error => {
          this.message.error('Không thể tải danh sách nhiệm vụ.');
          this.loading = false;
          this.showAlert = true;
          console.error('Error loading tasks:', error);
          return of({ items: [], totalCount: 0, page: 1, pageSize: 10 });
        })
      )
      .subscribe({
        next: (response) => {
          const items = response?.items || [];
          const totalCount = response?.totalCount || 0;
          
          this.listOfTasks = items;
          this.displayTasks = items;
          this.total = totalCount;
          this.loading = false;
          
          this.showAlert = this.listOfTasks.length === 0;
        },
        error: (error) => {
          console.error('Error in subscribe:', error);
          this.loading = false;
          this.showAlert = true;
          this.listOfTasks = [];
          this.displayTasks = [];
          this.total = 0;
        }
      });
  }

  // Thêm các phương thức để xử lý hover
  onTaskHover(task: Task): void {
    this.hoveredTask = task;
  }

  onTaskLeave(): void {
    this.hoveredTask = null;
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

  openTaskFormModal(task?: Task): void {
    const isEdit = !!task;
    const modalRef = this.modal.create({
      // nzTitle: isEdit ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ mới',
      nzContent: TaskFormModalComponent,
      nzWidth: 600,
      nzData: {
        task: task || null,
        assignerId: this.currentUser?.userId
      },
      nzFooter: null
    });

    modalRef.afterClose.subscribe(result => {
      if (result) {
        this.message.success(isEdit ? 'Cập nhật nhiệm vụ thành công!' : 'Thêm nhiệm vụ thành công!');
        this.loadTasks();
      }
    });
  }

  openProgressModal(task: Task): void {
    const modalRef = this.modal.create({
      // nzTitle: `Cập nhật tiến độ: ${task.title}`,
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