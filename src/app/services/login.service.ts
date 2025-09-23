import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environment/environment';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

// Định nghĩa interface cho API response thực tế
export interface LoginApiResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    userId: number;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
    userParent?: number;
    position?: string;
    positionId?: number;
    orgId?: number;
    unitId?: number;
    unitUserId?: number;
  } | null;
  message: string;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  login(username: string, password: string): Observable<User> {
    return this.http.post<LoginApiResponse>(
      `${environment.apiUrl}/api/v1/auth/login`, 
      { username, password }
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Đăng nhập thất bại');
        }
        
        const { 
          token, 
          refreshToken, 
          userId, 
          username, 
          fullName, 
          email, 
          phoneNumber, 
          role,
          userParent,
          position,
          positionId,
          orgId,
          unitId,
          unitUserId
        } = response.data;
        
        // Lưu token và thông tin người dùng thông qua AuthService
        const user: User = {
          userId,
          username,
          fullName,
          email: email || '',
          phoneNumber: phoneNumber || '',
          position: position || role || 'User',
          positionId,
          orgId,
          unitId,
          userParent,
          unitUserId,
          createdAt: new Date()
        };
        
        this.authService.saveLoginInfo(token, refreshToken, user);
        
        return user;
      }),
      catchError(error => {
        console.error('Login error:', error);
        if (error instanceof HttpErrorResponse) {
          return throwError(() => error);
        }
        return throwError(() => new Error(error.message || 'Đăng nhập thất bại'));
      })
    );
  }

  register(userData: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: number;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1//auth/register`, userData);
  }
}