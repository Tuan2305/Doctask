// src/app/components/edit-task-modal/edit-task-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { MockDataService } from '../../services/mock-data.service';
// Sửa import để sử dụng đúng types đã export
import { TaskAssignmentService, SubordinateUser, SubordinateUsersResponse } from '../../services/task-assignment.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-edit-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzDatePickerModule,
    NzSwitchModule,
    NzIconModule,
    NzDividerModule,
    NzTabsModule,
    NzInputNumberModule
  ],
  templateUrl: './edit-task-modal.component.html',
  styleUrls: ['./edit-task-modal.component.scss']
})
export class EditTaskModalComponent implements OnInit {
  @Input() nzData?: { 
    task: Task | null; 
    mode: 'edit' | 'add-subtask';
    parentTask?: Task;
  };

  editForm!: FormGroup;
  isLoading = false;
  assignees: SubordinateUser[] = [];
  peers: SubordinateUser[] = [];
  units: any[] = [];
  isAddingSubtask = false;
  isUnitAssignment = false;
  
  reportTabs = [
    { label: 'Ngày', value: 'daily' },
    { label: 'Tuần', value: 'weekly' },
    { label: 'Tháng', value: 'monthly' }
  ];
  
  selectedReportTab = 'daily';
  selectedReportIndex = 0;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private mockDataService: MockDataService,
    private taskAssignmentService: TaskAssignmentService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.isAddingSubtask = this.nzData?.mode === 'add-subtask';
    this.loadData();
    this.initForm();
  }

  loadData(): void {
    this.isLoading = true;
    
    if (this.isAddingSubtask) {
      this.taskAssignmentService.getSubordinateUsers().subscribe({
        next: (response: SubordinateUsersResponse) => {
          if (response.success) {
            this.assignees = response.data.subordinates;
            this.peers = response.data.peers;
          } else {
            this.message.error(response.message || 'Không thể tải danh sách người dùng');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading subordinate users:', error);
          this.message.error('Không thể tải danh sách người dùng');
          this.isLoading = false;
        }
      });
    } else {
      this.mockDataService.getAllUsers().subscribe(users => {
        this.assignees = users.map(user => ({
          userId: user.userId,
          fullName: user.fullName || '',
          email: user.email || '',
          username: user.username || user.email || '',
          orgId: 0,
          unitId: 0,
          userParent: 0
        }));
        this.isLoading = false;
      });
    }
    
    this.units = [
      { unitId: 1, unitName: 'Phòng Kỹ thuật' },
      { unitId: 2, unitName: 'Phòng Kinh doanh' },
      { unitId: 3, unitName: 'Phòng Nhân sự' }
    ];
  }

  initForm(): void {
    const task = this.nzData?.task;
    
    this.editForm = this.fb.group({
      title: [task?.title || '', [Validators.required]],
      dateRange: [
        task?.startDate && task?.dueDate ? 
        [new Date(task.startDate), new Date(task.dueDate)] : 
        [], 
        this.isAddingSubtask ? [Validators.required] : []
      ],
      assigneeIds: [[], this.isAddingSubtask ? [Validators.required] : []],
      unitIds: [[]],
      reportFrequency: ['daily'],
      intervalValue: [1, [Validators.min(1)]],
      description: [task?.description || '']
    });
  }

  onAssignTypeChange(isUnit: boolean): void {
    this.isUnitAssignment = isUnit;
    if (isUnit) {
      this.editForm.get('assigneeIds')?.setValue([]);
      this.editForm.get('assigneeIds')?.clearValidators();
      this.editForm.get('unitIds')?.setValidators([Validators.required]);
    } else {
      this.editForm.get('unitIds')?.setValue([]);
      this.editForm.get('unitIds')?.clearValidators();
      this.editForm.get('assigneeIds')?.setValidators([Validators.required]);
    }
    this.editForm.get('assigneeIds')?.updateValueAndValidity();
    this.editForm.get('unitIds')?.updateValueAndValidity();
  }

  onReportTabChange(value: string): void {
    this.selectedReportTab = value;
    this.selectedReportIndex = this.reportTabs.findIndex(tab => tab.value === value);
    this.editForm.patchValue({ reportFrequency: value });
  }

  getAllUsers(): SubordinateUser[] {
    return [...this.assignees, ...this.peers];
  }

  submitForm(): void {
    if (this.editForm.valid) {
      this.isLoading = true;
      const formValue = this.editForm.value;
      
      if (this.isAddingSubtask) {
        this.handleAddSubtask(formValue);
      } else {
        this.handleEditTask(formValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  handleAddSubtask(formValue: any): void {
    const [startDate, dueDate] = formValue.dateRange || [];
    
    const parentTaskId = this.nzData?.parentTask?.taskId;
    if (!parentTaskId) {
      this.message.error('Không tìm thấy task cha');
      this.isLoading = false;
      return;
    }
    
    const subtaskData = {
      title: formValue.title,
      description: formValue.description,
      assigneeIds: formValue.assigneeIds,
      unitIds: formValue.unitIds,
      startDate: startDate,
      endDate: dueDate,
      frequencyType: formValue.reportFrequency,
      intervalValue: formValue.intervalValue || 1,
      parentTaskId: parentTaskId
    };

    this.taskAssignmentService.createChildTask(subtaskData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message.success('Thêm việc con thành công!');
        this.modalRef.destroy(true);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating subtask:', error);
        this.message.error('Không thể tạo việc con. Vui lòng thử lại sau.');
      }
    });
  }

  handleEditTask(formValue: any): void {
    const updatedTask = {
      ...this.nzData?.task,
      title: formValue.title,
      description: formValue.description
    };

    console.log('Updating task:', updatedTask);
    
    setTimeout(() => {
      this.isLoading = false;
      this.message.success('Cập nhật công việc thành công!');
      this.modalRef.destroy(true);
    }, 1000);
  }

  cancelAssignment(): void {
    this.modalRef.destroy(false);
  }

  closeModal(): void {
    this.modalRef.destroy(false);
  }

  private markFormGroupTouched(): void {
    Object.values(this.editForm.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}