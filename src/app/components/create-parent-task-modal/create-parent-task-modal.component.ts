// src/app/components/create-parent-task-modal/create-parent-task-modal.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TaskAssignmentService } from '../../services/task-assignment.service';
import { NzMessageService } from 'ng-zorro-antd/message';

export interface CreateParentTaskRequest {
  title: string;
  description: string;
  priority: string;
  startDate: Date;
  dueDate: Date;
}

@Component({
  selector: 'app-create-parent-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzDatePickerModule,
    NzIconModule
  ],
  templateUrl: './create-parent-task-modal.component.html',
  styleUrls: ['./create-parent-task-modal.component.scss']
})
export class CreateParentTaskModalComponent implements OnInit {
  parentTaskForm!: FormGroup;
  isLoading = false;
  isSubmitted = false;

  priorityOptions = [
    { label: 'Thấp', value: 'low' },
    { label: 'Trung bình', value: 'medium' },
    { label: 'Cao', value: 'high' }
  ];

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private taskAssignmentService: TaskAssignmentService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.parentTaskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      priority: ['medium', [Validators.required]],
      dateRange: [[], [Validators.required]]
    });
  }

  submitForm(): void {
    if (this.parentTaskForm.valid && !this.isSubmitted) {
      this.isSubmitted = true; // Đánh dấu đã submit
      this.isLoading = true;
      
      const formValue = this.parentTaskForm.value;
      const [startDate, dueDate] = formValue.dateRange;

      const createRequest: CreateParentTaskRequest = {
        title: formValue.title,
        description: formValue.description || '',
        priority: formValue.priority,
        startDate: startDate,
        dueDate: dueDate
      };

      console.log('Submitting parent task:', createRequest); // Debug log

      this.taskAssignmentService.createParentTask(createRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Task created successfully:', response); // Debug log
          this.message.success('Tạo việc gốc thành công!');
          this.modalRef.destroy(response); // Trả về response để component cha xử lý
        },
        error: (error) => {
          this.isLoading = false;
          this.isSubmitted = false; // Reset flag nếu có lỗi
          console.error('Error creating parent task:', error);
          this.message.error('Không thể tạo việc gốc. Vui lòng thử lại sau.');
        }
      });
    } else if (this.isSubmitted) {
      console.log('Form already submitted, ignoring duplicate submission');
    } else {
      this.markFormGroupTouched();
    }
  }

  closeModal(): void {
    this.modalRef.destroy(false);
  }

  private markFormGroupTouched(): void {
    Object.values(this.parentTaskForm.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}