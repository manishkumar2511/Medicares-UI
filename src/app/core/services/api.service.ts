import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, throwError, timeout } from "rxjs";
import { Result } from "../models";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private http = inject(HttpClient);

  private readonly baseUrl = environment.apiUrl;
  private readonly defaultTimeout = 30000;

  get<T>(
    path: string,
    params: Record<string, string | number | boolean> = {},
    options?: { showLoader?: boolean }
  ): Observable<T> {
    return this.request<T>("GET", path, { params, ...options });
  }

  post<T>(
    path: string,
    body: unknown,
    options?: { showLoader?: boolean }
  ): Observable<T> {
    return this.request<T>("POST", path, { body, ...options });
  }
  

  private request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      params?: Record<string, string | number | boolean>;
      showLoader?: boolean;
    } = {}
  ): Observable<T> {
    const url = this.buildUrl(path);

    const httpParams = options.params
      ? new HttpParams({ fromObject: options.params })
      : undefined;

    const headers = new HttpHeaders(
      options.showLoader ? { "Show-Loader": "true" } : {}
    );

    return this.http
      .request<T>(method, url, {
        body: options.body,
        params: httpParams,
        headers,
      })
      .pipe(
        timeout({
          each: this.defaultTimeout,
          with: () => throwError(() => new Error("Request timed out")),
        }),
        catchError(this.handleError)
      );
  }

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.error?.result) {
      const apiResult = error.error.result as Result<unknown>;
      if (typeof apiResult.succeeded === "boolean") {
        return throwError(() => apiResult);
      }
    }

    if (error.error && typeof error.error.succeeded === "boolean") {
      const apiResult = error.error as Result<unknown>;
      return throwError(() => apiResult);
    }

    const fallback: Result<unknown> = {
      data: null,
      succeeded: false,
      messages: [error.message || "Unexpected error occurred"],
    };

    return throwError(() => fallback);
  }
}