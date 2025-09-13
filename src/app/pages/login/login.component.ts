import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginService } from '../../services/login.service'; // Import service mới
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  returnUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
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

    // Lấy returnUrl từ query params nếu có
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tasks';

    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
  }

  submitForm(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;
      
      // Sử dụng service mới
      this.loginService.login(username, password).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.message.success('Đăng nhập thành công!');
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (error) => {
          this.isLoading = false;
          
          if (error.status === 401 || error.message?.includes('Đăng nhập thất bại') || error.message?.includes('sai')) {
            this.message.error('Tên đăng nhập hoặc mật khẩu không đúng.');
          } else if (error.status === 0) {
            this.message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
          } else {
            this.message.error(`Đã xảy ra lỗi: ${error.message || 'Lỗi không xác định'}`);
          }
          console.error('Login error:', error);
        }
      });
    } else {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}