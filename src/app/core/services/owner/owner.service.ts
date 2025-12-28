import { inject, Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import { catchError, throwError } from "rxjs";
import { Result } from "../../models";
import { ToastService } from "..";

@Injectable({
  providedIn: 'root',
})
export class OwnerService {
  apiService = inject(ApiService);
  private toastService = inject(ToastService);


  ownerRegistration(ownerRegisterationData: FormData) {
    debugger;
  return this.apiService
    .post<boolean>('auth/get-started', ownerRegisterationData, { showLoader: true })
    .pipe(
      catchError((error: Result<unknown>) => {
        error.messages.forEach(msg =>
          this.toastService.error('Error', msg)
        );
        return throwError(() => error);
      })
    );
}
}