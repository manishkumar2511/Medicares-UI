import { inject, Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import { catchError, Observable, throwError } from "rxjs";
import { Result } from "../../models";
import { State } from "../../models/common/state.model";

@Injectable({ providedIn: "root" })
export class CommonService {
    apiService = inject(ApiService);

    getState(): Observable<State[]> {
    return this.apiService.get<State[]>("state/get-all").pipe(
      catchError((error: Result<unknown>) => {
        return throwError(() => error.messages);
      })
    );
  }
}