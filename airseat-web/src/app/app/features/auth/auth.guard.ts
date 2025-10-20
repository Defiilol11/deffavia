import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from './user-store.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(UserStore);
  const router = inject(Router);
  if (store.isLoggedIn()) return true;
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
