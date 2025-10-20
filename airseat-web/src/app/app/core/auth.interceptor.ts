import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserStore } from '../features/auth/user-store.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(UserStore);
  const token = store.token();
  if (token) {
    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(cloned);
  }
  return next(req);
};
