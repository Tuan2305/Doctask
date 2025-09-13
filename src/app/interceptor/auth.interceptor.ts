import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  
  // Không thêm token cho các requests đăng nhập và đăng ký
  if (req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/refresh')) {
    return next(req);
  }

  const token = authService.getAccessToken();
  
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Xử lý token hết hạn
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Nếu token hết hạn (401 Unauthorized), thử refresh token
        if (error.status === 401 && !req.url.includes('/refresh')) {
          return authService.refreshToken().pipe(
            switchMap((newToken) => {
              // Thêm token mới vào request và gọi lại
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(newReq);
            }),
            catchError((refreshError) => {
              // Nếu refresh token cũng thất bại, logout
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};