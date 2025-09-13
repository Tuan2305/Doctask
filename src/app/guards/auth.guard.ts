
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      const isLoggedIn = !!user;
      
      if (isLoggedIn) {
        return true;
      }

      // Lưu lại URL đã cố gắng truy cập để redirect sau khi đăng nhập
      router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    })
  );
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      const isLoggedIn = !!user;
      
      if (isLoggedIn) {
        // Nếu đã đăng nhập mà cố truy cập trang login, chuyển hướng đến trang chính
        router.navigate(['/tasks']);
        return false;
      }

      return true;
    })
  );
};