import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, EMPTY, throwError, timer } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { tap, map, filter, take, catchError, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  AuthState,
  DecodedToken,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  User,
  Verify2FACodeRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  // Storage keys
  private readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';

  // API endpoints
  private readonly authEndpoints = {
    login: 'auth/login',
    logout: 'auth/logout',
    refresh: 'auth/refresh-token',
    forgotPassword: 'auth/forgot-password',
    resetPassword: 'auth/reset-password',
    verifyCode: 'auth/verify-2fa',
    resendMfa: 'auth/resend-2fa',
  };

  // Auth state
  private readonly authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
  });

  public readonly authState$ = this.authStateSubject.asObservable();
  public readonly isAuthenticated$ = this.authState$.pipe(
    map((state) => state.isAuthenticated)
  );
  public readonly user$ = this.authState$.pipe(map((state) => state.user));
  public readonly isLoading$ = this.authState$.pipe(
    map((state) => state.isLoading)
  );

  // Refresh handling
  private refreshTokenInProgress = false;
  private readonly tokenRefreshSubject = new BehaviorSubject<string | null>(
    null
  );

  constructor() {
    this.initializeAuthState();
    this.setupTokenRefreshTimer();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);

    return this.apiService
      .post<LoginResponse>(this.authEndpoints.login, credentials)
      .pipe(
        tap((response) => {
          if (!response.requiresMfa) {
            this.handleSuccessfulAuth(response);
          }
        }),
        finalize(() => this.setLoading(false))
      );
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.clearAuthState();
      return EMPTY;
    }

    return this.apiService.get<void>(this.authEndpoints.logout).pipe(
      tap(() => this.clearAuthState()),
      catchError(() => {
        this.clearAuthState();
        return EMPTY;
      })
    );
  }

  verifyCode(request: Verify2FACodeRequest): Observable<LoginResponse> {
    return this.apiService
      .post<LoginResponse>(this.authEndpoints.verifyCode, request)
      .pipe(tap((res) => this.handleSuccessfulAuth(res)));
  }

  forgotPassword(
    request: ForgotPasswordRequest
  ): Observable<ForgotPasswordResponse> {
    return this.apiService.post<ForgotPasswordResponse>(
      this.authEndpoints.forgotPassword,
      request
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<LoginResponse> {
    return this.apiService
      .post<LoginResponse>(this.authEndpoints.resetPassword, request)
      .pipe(tap((res) => this.handleSuccessfulAuth(res)));
  }

  resendMfa(email: string): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>(
      this.authEndpoints.resendMfa,
      { email }
    );
  }

  refreshTokens(): Observable<string> {
    if (this.refreshTokenInProgress) {
      return this.tokenRefreshSubject.pipe(
        filter((token) => token !== null),
        take(1)
      );
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuthState();
      return throwError(() => new Error('No refresh token'));
    }

    this.refreshTokenInProgress = true;

    return this.apiService
      .post<LoginResponse>(this.authEndpoints.refresh, { refreshToken })
      .pipe(
        tap((res) => {
          this.handleSuccessfulAuth(res);
          this.tokenRefreshSubject.next(res.token?.accessToken ?? null);
          this.refreshTokenInProgress = false;
        }),
        map((res) => res.token?.accessToken ?? ''),
        catchError((err) => {
          this.refreshTokenInProgress = false;
          this.clearAuthState();
          return throwError(() => err);
        })
      );
  }
  getAccessToken(): string | null {
    return this.authStateSubject.value.accessToken;
  }

  getRefreshToken(): string | null {
    return this.authStateSubject.value.refreshToken;
  }

  getUser(): User | null {
    return this.authStateSubject.value.user;
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  getRole(): string | undefined {
    return this.getUser()?.role;
  }

  getRoleId(): string {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY)!;
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.roleId;
  }

  // ------------------------------------------------------------------
  // INTERNAL
  // ------------------------------------------------------------------

  private handleSuccessfulAuth(response: LoginResponse): void {
    if (response.requiresMfa) return;

    const accessToken = response.token?.accessToken;
    const refreshToken = response.refreshToken;
    const user = response.user;

    if (!accessToken || !user) return;

    const mappedUser: User = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber ?? '',
      profileImageUrl: user.profileImageUrl ?? '',
    };

    this.setStoredAccessToken(accessToken);
    if (refreshToken) {
      this.setStoredRefreshToken(refreshToken);
    }
    this.setStoredUser(mappedUser);

    this.authStateSubject.next({
      isAuthenticated: true,
      user: mappedUser,
      accessToken,
      refreshToken: refreshToken ?? null,
      isLoading: false,
    });
  }

  private initializeAuthState(): void {
    if (!this.isBrowser()) {
      this.setLoading(false);
      return;
    }

    const accessToken = this.getStoredAccessToken();
    const refreshToken = this.getStoredRefreshToken();
    const user = this.getStoredUser();

    if (
      accessToken &&
      refreshToken &&
      user &&
      !this.isTokenExpired(accessToken)
    ) {
      this.authStateSubject.next({
        isAuthenticated: true,
        user,
        accessToken,
        refreshToken,
        isLoading: false,
      });
    } else {
      this.clearAuthState(false);
    }
  }

  private setupTokenRefreshTimer(): void {
    this.authState$
      .pipe(filter((s) => s.isAuthenticated && !!s.accessToken))
      .subscribe((state) => {
        const payload = JSON.parse(atob(state.accessToken!.split('.')[1]));
        const expiry = payload.exp * 1000;
        const refreshIn = Math.max(expiry - Date.now() - 5 * 60 * 1000, 0);

        timer(refreshIn).subscribe(() => {
          this.refreshTokens().subscribe();
        });
      });
  }

  private setLoading(isLoading: boolean): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      isLoading,
    });
  }

  private clearAuthState(redirect: boolean = true): void {
    this.clearStoredTokens();

    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
    });

    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  // ------------------------------------------------------------------
  // STORAGE
  // ------------------------------------------------------------------

  private getStoredAccessToken(): string | null {
    return this.isBrowser()
      ? localStorage.getItem(this.ACCESS_TOKEN_KEY)
      : null;
  }

  private setStoredAccessToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  private getStoredRefreshToken(): string | null {
    return this.isBrowser()
      ? localStorage.getItem(this.REFRESH_TOKEN_KEY)
      : null;
  }

  private setStoredRefreshToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  private getStoredUser(): User | null {
    if (!this.isBrowser()) return null;
    const value = localStorage.getItem(this.USER_KEY);
    return value ? (JSON.parse(value) as User) : null;
  }

  private setStoredUser(user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private clearStoredTokens(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
