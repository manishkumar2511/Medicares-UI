import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services";
import { inject } from "@angular/core";
import { Title } from "@angular/platform-browser";

export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const titleService = inject(Title);

  if (authService.isLoggedIn()) {
    const role = authService.getRole()?.toLowerCase();
    const targetRoute = role === 'superadmin' ? '/super-admin/dashboard' : '/owner-dashboard';
    const title = role === 'superadmin' ? 'Super Admin Dashboard' : 'Owner Dashboard';

    // Reset title immediately before redirect to prevent tab title flash
    titleService.setTitle(title);

    // replaceUrl:true removes the guest route from browser history
    // so pressing back won't revisit it and won't trigger another title change
    router.navigate([targetRoute], { replaceUrl: true });
    return false;
  }

  return true;
};