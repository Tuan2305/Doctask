import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message'; // thêm
import { MockDataService } from '../../services/mock-data.service';
import { TaskStatus } from '../../models/task.model';
import { TaskApiService } from '../../services/task.service';

@Component({
  selector: 'app-progress-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSliderModule,
    NzInputNumberModule,
    NzSelectModule
  ],
  templateUrl: './progress-modal.component.html',
  styleUrls: ['./progress-modal.component.scss']
})
export class ProgressModalComponent implements OnInit {
  @Input() nzData?: { taskId: number; currentProgress: number; currentStatus: TaskStatus };

  progressForm!: FormGroup;
  isLoading = false;
  statuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'delayed'];

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private mockDataService: MockDataService,
    private taskApiService: TaskApiService,      // thêm
    private message: NzMessageService            // thêm
  ) {}

  ngOnInit(): void {
    const currentProgress = this.nzData?.currentProgress ?? 0;
    const currentStatus = this.nzData?.currentStatus ?? 'pending';

    this.progressForm = this.fb.group({
      percentageComplete: [currentProgress, [Validators.required, Validators.min(0), Validators.max(100)]],
      status: [currentStatus, [Validators.required]],
      comment: ['']
    });
  }

  submitForm(): void {
    if (this.progressForm.valid) {
      this.isLoading = true;
      const { percentageComplete, status, comment } = this.progressForm.value;

      if (this.nzData?.taskId) {
        this.taskApiService
          .updateTaskProgress(this.nzData.taskId, percentageComplete, status)
          .subscribe({
            next: () => {
              this.isLoading = false;
              this.modalRef.destroy(true);
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Error updating task progress:', err);
              this.message.error('Không thể cập nhật tiến độ. Vui lòng thử lại sau.');
            }
          });
      } else {
        this.isLoading = false;
        this.message.error('Không xác định được ID nhiệm vụ.');
      }
    } else {
      Object.values(this.progressForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  closeModal(): void {
    this.modalRef.destroy(false);
  }
}
