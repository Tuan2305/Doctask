import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { MockDataService } from '../../services/mock-data.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs'; // Thêm Observable

@Component({
  selector: 'app-task-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputNumberModule
  ],
  templateUrl: './task-form-modal.component.html',
  styleUrls: ['./task-form-modal.component.scss']
})
export class TaskFormModalComponent implements OnInit {
  // Sửa kiểu dữ liệu để chỉ chấp nhận number cho assignerId
  @Input() nzData?: { task: Task | null; assignerId: number };

  taskForm!: FormGroup;
  isLoading = false;
  assignees: User[] = [];
  priorities: TaskPriority[] = ['low', 'medium', 'high'];
  statuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'delayed'];

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private mockDataService: MockDataService
  ) {}

  ngOnInit(): void {
    this.loadAssignees();

    const task = this.nzData?.task;
    const assignerId = this.nzData?.assignerId;

    this.taskForm = this.fb.group({
      title: [task?.title || '', [Validators.required]],
      description: [task?.description || ''],
      assigneeId: [task?.assigneeId || null, [Validators.required]],
      priority: [task?.priority || 'medium', [Validators.required]],
      status: [task?.status || 'pending', [Validators.required]],
      dateRange: [
        task?.startDate && task?.dueDate ? [new Date(task.startDate), new Date(task.dueDate)] : [],
        [Validators.required]
      ],
    });
  }

  loadAssignees(): void {
    this.mockDataService.getAllUsers().subscribe(users => {
      this.assignees = users;
    });
  }

  submitForm(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      const formValue = this.taskForm.value;
      const [startDate, dueDate] = formValue.dateRange;

      const taskToSave: Partial<Task> = {
        title: formValue.title,
        description: formValue.description,
        assignerId: this.nzData?.assignerId, // Đã sửa kiểu dữ liệu nên không cần ép kiểu
        assigneeId: formValue.assigneeId,
        priority: formValue.priority,
        status: formValue.status,
        startDate: startDate,
        dueDate: dueDate,
      };

      let operation: Observable<Task>;
      if (this.nzData?.task) {
        // Update existing task
        operation = this.mockDataService.updateTask({ ...this.nzData.task, ...taskToSave } as Task);
      } else {
        // Add new task
        operation = this.mockDataService.addTask(taskToSave as Omit<Task, 'taskId' | 'createdAt' | 'status' | 'progressPercentage'>);
      }

      operation.subscribe(
        () => {
          this.isLoading = false;
          this.modalRef.destroy(true); // Close modal and pass true for success
        },
        (error: any) => {
          this.isLoading = false;
          console.error('Error saving task:', error);
          // Handle error, e.g., show a message
        }
      );
    } else {
      Object.values(this.taskForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  closeModal(): void {
    this.modalRef.destroy(false); // Close modal and pass false for cancellation
  }
}