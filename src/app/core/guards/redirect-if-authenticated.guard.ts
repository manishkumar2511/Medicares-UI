import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services";
import { inject } from "@angular/core";

export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService) as AuthService;
  const router = inject(Router);

  //   if (authService.isLoggedIn()) {
  //     router.navigate(["/dashboard"]);
  //     return false;
  //   }
  return true;
};