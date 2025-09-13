// // src/app/components/task-assignment-modal/task-assignment-modal.ts
// import { Component, OnInit, Input } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { NzModalRef } from 'ng-zorro-antd/modal'; // Chỉ giữ lại một import này
// import { NzFormModule } from 'ng-zorro-antd/form';
// import { NzInputModule } from 'ng-zorro-antd/input';
// import { NzButtonModule } from 'ng-zorro-antd/button';
// import { NzSelectModule } from 'ng-zorro-antd/select';
// import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
// import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
// import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
// import { NzDividerModule } from 'ng-zorro-antd/divider';
// import { NzTransferModule } from 'ng-zorro-antd/transfer';
// import { NzMessageService } from 'ng-zorro-antd/message';
// import { Task } from '../../models/task.model';
// import { TaskAssignmentService, SubordinateUser, Unit, SubordinateUsersResponse } from '../../services/task-assignment.service';
// import { forkJoin, Observable, of } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// // Xóa dòng import duplicate: import { NzModalRef } from 'ng-zorro-antd/modal'; // nếu bạn m...

// @Component({
//   selector: 'app-task-assignment-modal',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     NzFormModule,
//     NzInputModule,
//     NzButtonModule,
//     NzSelectModule,
//     NzDatePickerModule,
//     NzInputNumberModule,
//     NzCheckboxModule,
//     NzDividerModule,
//     NzTransferModule
//   ],
//   templateUrl: './task-assignment-modal.html',
//   styleUrls: ['./task-assignment-modal.scss']
// })
// export class TaskAssignmentModalComponent implements OnInit {
//   @Input() nzData?: { parentTask?: Task; isChildTask?: boolean };
  
//   taskForm!: FormGroup;
//   isLoading = false;
//   subordinateUsers: SubordinateUser[] = [];
//   subordinateUnits: Unit[] = [];
//   frequencyTypes = [
//     { value: 'once', label: 'Một lần' },
//     { value: 'daily', label: 'Hàng ngày' },
//     { value: 'weekly', label: 'Hàng tuần' },
//     { value: 'monthly', label: 'Hàng tháng' }
//   ];
//   daysOfWeek = [
//     { value: 1, label: 'Thứ 2' },
//     { value: 2, label: 'Thứ 3' },
//     { value: 3, label: 'Thứ 4' },
//     { value: 4, label: 'Thứ 5' },
//     { value: 5, label: 'Thứ 6' },
//     { value: 6, label: 'Thứ 7' },
//     { value: 0, label: 'Chủ nhật' }
//   ];
  
//   constructor(
//     private fb: FormBuilder,
//     private modalRef: NzModalRef,
//     private taskAssignmentService: TaskAssignmentService,
//     private message: NzMessageService
//   ) {}

//   ngOnInit(): void {
//     this.loadData();
//     this.initializeForm();
//   }

//   loadData(): void {
//     this.isLoading = true;
//     forkJoin({
//       users: this.taskAssignmentService.getSubordinateUsers().pipe(
//         catchError(err => {
//           console.error('Error loading subordinate users:', err);
//           return of({ success: false, data: { subordinates: [], peers: [] }, message: '', error: null } as SubordinateUsersResponse);
//         })
//       ),
//       units: this.taskAssignmentService.getSubordinateUnits().pipe(
//         catchError(err => {
//           console.error('Error loading subordinate units:', err);
//           return of([] as Unit[]);
//         })
//       )
//     }).subscribe({
//       next: (result) => {
//         if (result.users.success) {
//           this.subordinateUsers = [...result.users.data.subordinates, ...result.users.data.peers];
//         }
//         this.subordinateUnits = result.units;
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error loading data:', error);
//         this.message.error('Không thể tải dữ liệu người dùng và đơn vị.');
//         this.isLoading = false;
//       }
//     });
//   }

//   initializeForm(): void {
//     const isChildTask = this.nzData?.isChildTask || false;
    
//     if (isChildTask && this.nzData?.parentTask) {
//       this.taskForm = this.fb.group({
//         title: ['', [Validators.required]],
//         description: [''],
//         assigneeIds: [[], [Validators.required]],
//         unitIds: [[]],
//         startDate: [null, [Validators.required]],
//         endDate: [null, [Validators.required]],
//         frequencyType: ['once', [Validators.required]],
//         intervalValue: [1, [Validators.min(1)]],
//         daysOfWeek: [[]],
//         daysOfMonth: [[]],
//         parentTaskId: [this.nzData.parentTask.taskId]
//       });
//     } else {
//       const task = this.nzData?.parentTask;
//       this.taskForm = this.fb.group({
//         title: [task?.title || '', [Validators.required]],
//         description: [task?.description || ''],
//         priority: [task?.priority || 'medium', [Validators.required]],
//         startDate: [task?.startDate ? new Date(task.startDate) : null, [Validators.required]],
//         dueDate: [task?.dueDate ? new Date(task.dueDate) : null, [Validators.required]]
//       });
//     }
    
//     this.taskForm.get('frequencyType')?.valueChanges.subscribe(value => {
//       const daysOfWeekCtrl = this.taskForm.get('daysOfWeek');
//       const daysOfMonthCtrl = this.taskForm.get('daysOfMonth');
      
//       if (value === 'weekly') {
//         daysOfWeekCtrl?.setValidators([Validators.required]);
//         daysOfMonthCtrl?.clearValidators();
//       } else if (value === 'monthly') {
//         daysOfMonthCtrl?.setValidators([Validators.required]);
//         daysOfWeekCtrl?.clearValidators();
//       } else {
//         daysOfWeekCtrl?.clearValidators();
//         daysOfMonthCtrl?.clearValidators();
//       }
      
//       daysOfWeekCtrl?.updateValueAndValidity();
//       daysOfMonthCtrl?.updateValueAndValidity();
//     });
//   }

//   submitForm(): void {
//     if (this.taskForm.valid) {
//       this.isLoading = true;
//       const formValue = this.taskForm.value;
      
//       let operation: Observable<any>;
      
//       if (this.nzData?.isChildTask) {
//         operation = this.taskAssignmentService.createChildTask({
//           title: formValue.title,
//           description: formValue.description,
//           assigneeIds: formValue.assigneeIds,
//           unitIds: formValue.unitIds,
//           startDate: formValue.startDate,
//           endDate: formValue.endDate,
//           frequencyType: formValue.frequencyType,
//           intervalValue: formValue.intervalValue,
//           daysOfWeek: formValue.daysOfWeek,
//           daysOfMonth: formValue.daysOfMonth,
//           parentTaskId: formValue.parentTaskId
//         });
//       } else if (this.nzData?.parentTask) {
//         operation = this.taskAssignmentService.updateParentTask(
//           this.nzData.parentTask.taskId,
//           {
//             title: formValue.title,
//             description: formValue.description,
//             startDate: formValue.startDate,
//             dueDate: formValue.dueDate
//           }
//         );
//       } else {
//         operation = this.taskAssignmentService.createParentTask({
//           title: formValue.title,
//           description: formValue.description,
//           priority: formValue.priority,
//           startDate: formValue.startDate,
//           dueDate: formValue.dueDate
//         });
//       }
      
//       operation.subscribe({
//         next: () => {
//           this.isLoading = false;
//           this.message.success('Thao tác thành công!');
//           this.modalRef.destroy(true);
//         },
//         error: (error) => {
//           this.isLoading = false;
//           console.error('Error submitting task:', error);
//           this.message.error('Không thể lưu nhiệm vụ. Vui lòng thử lại sau.');
//         }
//       });
//     } else {
//       Object.values(this.taskForm.controls).forEach(control => {
//         if (control.invalid) {
//           control.markAsDirty();
//           control.updateValueAndValidity();
//         }
//       });
//     }
//   }

//   closeModal(): void {
//     this.modalRef.destroy(false);
//   }
  
//   getDaysOfMonth(): { value: number; label: string }[] {
//     return Array.from({ length: 31 }, (_, i) => ({
//       value: i + 1,
//       label: `Ngày ${i + 1}`
//     }));
//   }
// }