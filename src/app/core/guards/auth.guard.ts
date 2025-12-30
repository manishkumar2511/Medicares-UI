import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../services";

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService) as AuthService;
  const router = inject(Router);
  //   if (authService.isAuthenticated()) {
  //     return true;
  //   }
  router.navigate(["/login"]);
  return false;
};
