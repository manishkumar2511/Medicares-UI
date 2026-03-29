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


  ownerRegistration(data: { email: string; password: string }) {
    return this.apiService
      .post<Result<string>>('auth/get-started', data, { showLoader: true })
      .pipe(
        catchError((error: Result<unknown>) => {
          error.messages?.forEach(msg =>
            this.toastService.error('Error', msg)
          );
          return throwError(() => error);
        })
      );
  }
}