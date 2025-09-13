// src/app/pages/task-assignment/task-assignment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CreateParentTaskModalComponent } from '../../components/create-parent-task-modal/create-parent-task-modal.component';
import { TaskAssignmentService } from '../../services/task-assignment.service';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model'; // Thêm TaskPriority và TaskStatus vào import
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-task-assignment',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzEmptyModule,
    NzSpinModule,
    NzListModule,
    NzCardModule
  ],
  templateUrl: './task-assignment.component.html',
  styleUrls: ['./task-assignment.component.scss']
})
export class TaskAssignmentComponent implements OnInit {
  parentTasks: Task[] = [];
  loading = false;
  currentUser: User | null = null;

  constructor(
    private modal: NzModalService,
    private message: NzMessageService,
    private taskAssignmentService: TaskAssignmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser) {
        this.loadParentTasks();
      }
    });
  }

  loadParentTasks(): void {
    this.loading = true;
    
    // Gọi API để lấy danh sách parent tasks thực tế
    this.taskAssignmentService.getParentTasks().subscribe({
      next: (tasks) => {
        this.parentTasks = tasks;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading parent tasks:', error);
        this.loading = false;
        // Fallback to mock data if API fails
        this.parentTasks = [];
      }
    });
  }

  openCreateParentTaskModal(): void {
    const modalRef = this.modal.create({
      nzContent: CreateParentTaskModalComponent,
      nzWidth: 600,
      nzFooter: null,
      nzMaskClosable: false,
      nzClosable: true
    });

    modalRef.afterClose.subscribe(result => {
      if (result && result.success) {
        this.message.success('Tạo việc gốc thành công!');
        
        // Chuyển đổi response thành Task object
        const newTask: Task = {
          taskId: result.data.taskId,
          title: result.data.title,
          description: result.data.description,
          startDate: result.data.startDate,
          dueDate: result.data.dueDate,
          priority: result.data.priority as TaskPriority, // Đã có import
          status: 'pending' as TaskStatus // Đã có import
        };

        // Thêm task mới vào đầu danh sách (KHÔNG reload toàn bộ)
        this.parentTasks.unshift(newTask);
      }
    });
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  }

  // Thêm method để lấy text priority
  getPriorityText(priority: string): string {
    switch(priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Trung bình';
    }
  }

  // Thêm method để xem chi tiết task
  viewTaskDetails(task: Task): void {
    // Navigate to task detail page hoặc mở modal chi tiết
    console.log('View task details:', task);
  }
}