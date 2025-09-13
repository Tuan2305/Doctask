import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginService } from '../../services/login.service'; // Import service mới
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private loginService: LoginService, // Inject service mới
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    // Kiểm tra xem đã đăng nhập chưa
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/tasks']);
      return;
    }

    this.registerForm = this.fb.group({
      fullName: [null, [Validators.required]],
      username: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [Validators.required, this.confirmPasswordValidator]],
      email: [null, [Validators.email]],
      phoneNumber: [null],
      role: [3] 
    });
  }

  confirmPasswordValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.registerForm?.get('password')?.value) {
      return { confirm: true };
    }
    return {};
  };

  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.registerForm.controls['confirmPassword'].updateValueAndValidity());
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const formData = {...this.registerForm.value};
      delete formData.confirmPassword; // Không gửi confirmPassword lên server

      this.loginService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          
          if (error.status === 409) {
            this.message.error('Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.');
            } else if (error.status === 0) {
            this.message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
          } else {
            this.message.error(`Đăng ký thất bại: ${error.error?.message || 'Lỗi không xác định'}`);
          }
          console.error('Register error:', error);
        }
      });
    } else {
      Object.values(this.registerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}