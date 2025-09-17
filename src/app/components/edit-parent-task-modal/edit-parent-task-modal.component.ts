// src/app/components/edit-parent-task-modal/edit-parent-task-modal.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TaskAssignmentService, UpdateParentTaskRequest } from '../../services/task-assignment.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-edit-parent-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // Thêm FormsModule cho ngModel
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzDatePickerModule,
    NzIconModule,
    NzSwitchModule // Thêm NzSwitchModule
  ],
  templateUrl: './edit-parent-task-modal.component.html',
  styleUrls: ['./edit-parent-task-modal.component.scss']
})
export class EditParentTaskModalComponent implements OnInit {
  @Input() nzData?: { task: Task };
  
  editTaskForm!: FormGroup;
  isLoading = false;

  // Các flag để kiểm soát hiển thị
  isEditingTitle = false;
  isEditingDescription = false;
  isEditingTime = false;

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
    const task = this.nzData?.task;
    
    this.editTaskForm = this.fb.group({
      title: [
        { value: task?.title || '', disabled: !this.isEditingTitle }, 
        [Validators.maxLength(200)]
      ],
      description: [
        { value: task?.description || '', disabled: !this.isEditingDescription }, 
        [Validators.maxLength(1000)]
      ],
      dateRange: [
        { 
          value: task ? [new Date(task.startDate), new Date(task.dueDate)] : [], 
          disabled: !this.isEditingTime 
        }
      ]
    });
  }

  // Toggle methods để bật/tắt editing
  toggleEditTitle(): void {
    const titleControl = this.editTaskForm.get('title');
    if (this.isEditingTitle) {
      titleControl?.enable();
      titleControl?.setValidators([Validators.required, Validators.maxLength(200)]);
    } else {
      titleControl?.disable();
      titleControl?.clearValidators();
    }
    titleControl?.updateValueAndValidity();
  }

  toggleEditDescription(): void {
    const descControl = this.editTaskForm.get('description');
    if (this.isEditingDescription) {
      descControl?.enable();
      descControl?.setValidators([Validators.maxLength(1000)]);
    } else {
      descControl?.disable();
      descControl?.clearValidators();
    }
    descControl?.updateValueAndValidity();
  }

  toggleEditTime(): void {
    const dateControl = this.editTaskForm.get('dateRange');
    if (this.isEditingTime) {
      dateControl?.enable();
      dateControl?.setValidators([Validators.required]);
    } else {
      dateControl?.disable();
      dateControl?.clearValidators();
    }
    dateControl?.updateValueAndValidity();
  }

  submitForm(): void {
    // Kiểm tra xem có ít nhất một trường được chọn để edit không
    if (!this.isEditingTitle && !this.isEditingDescription && !this.isEditingTime) {
      this.message.warning('Vui lòng chọn ít nhất một mục để chỉnh sửa!');
      return;
    }

    // Validate form với chỉ các trường được enable
    const formValid = this.validateEnabledFields();
    
    if (formValid && this.nzData?.task) {
      this.isLoading = true;
      
      // Tạo request object chỉ với các trường được chỉnh sửa
      const updateRequest = this.buildUpdateRequest();

      console.log('🔄 Updating parent task:', updateRequest);

      this.taskAssignmentService.updateParentTask(this.nzData.task.taskId, updateRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Task updated successfully:', response);
          this.message.success('Cập nhật việc gốc thành công!');
          this.modalRef.destroy({ success: true, data: response });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error updating parent task:', error);
          this.message.error('Không thể cập nhật việc gốc. Vui lòng thử lại sau.');
        }
      });
    }
  }

  private validateEnabledFields(): boolean {
    let isValid = true;

    if (this.isEditingTitle) {
      const titleControl = this.editTaskForm.get('title');
      if (!titleControl?.value || titleControl.value.trim() === '') {
        titleControl?.setErrors({ required: true });
        isValid = false;
      }
    }

    if (this.isEditingTime) {
      const dateControl = this.editTaskForm.get('dateRange');
      if (!dateControl?.value || dateControl.value.length !== 2) {
        dateControl?.setErrors({ required: true });
        isValid = false;
      }
    }

    return isValid;
  }

  private buildUpdateRequest(): UpdateParentTaskRequest {
    const formValue = this.editTaskForm.getRawValue(); // getRawValue() để lấy cả disabled fields
    const task = this.nzData?.task!;
    
    const updateRequest: UpdateParentTaskRequest = {
      title: this.isEditingTitle ? formValue.title : task.title,
      description: this.isEditingDescription ? formValue.description : (task.description || ''),
      startDate: this.isEditingTime ? formValue.dateRange[0] : new Date(task.startDate),
      dueDate: this.isEditingTime ? formValue.dateRange[1] : new Date(task.dueDate)
    };

    return updateRequest;
  }

  closeModal(): void {
    this.modalRef.destroy(false);
  }
}
