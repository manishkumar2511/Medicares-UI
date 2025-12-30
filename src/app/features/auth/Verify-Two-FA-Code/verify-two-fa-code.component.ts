import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription, take } from 'rxjs';
import { AuthService } from '../../../core/services';

import { PrimematerialModule } from '../../../core/primematerial.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify-two-fa-code',
  standalone: true,
  imports: [PrimematerialModule, RouterLink],
  templateUrl: './verify-two-fa-code.component.html',
  styleUrl: './verify-two-fa-code.component.scss'
})
export class VerifyTwoFACodeComponent implements OnInit, OnDestroy {
  codeStr = "";
  email = "";
  token = "";
  submitted = false;
  loading = false;
  resending = false;

  error = "";
  success = "";
  resendSuccess = "";

  // Resend cooldown
  resendCooldown = 0;
  private cooldownSubscription?: Subscription;

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    const nav = this.router.getCurrentNavigation();
    this.email = nav?.extras?.state?.["email"] ?? "";
    this.token = nav?.extras?.state?.["token"] ?? "";
  }

  ngOnInit(): void {
    // If no email, redirect back to login
    if (!this.email) {
      this.router.navigate(["account/login"]);
    } else {
      // Start cooldown immediately on load
      this.startCooldown();
    }
  }

  ngOnDestroy(): void {
    this.cooldownSubscription?.unsubscribe();
  }

  onSubmit(): void {
    if (!this.codeStr || this.codeStr.length < 6) {
      this.error = "Please enter the 6-digit code.";
      return;
    }

    this.error = "";
    this.success = "";
    this.resendSuccess = "";
    this.loading = true;

    this.authService
      .verifyCode({ email: this.email, code: this.codeStr })
      .subscribe({
        next: () => {
          this.submitted = true;
          this.loading = false;
          this.success = "Code verified successfully. Redirecting...";
          setTimeout(() => this.router.navigate(["/dashboard"]), 1200);
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.message || "Invalid or expired code. Please try again.";
        },
      });
  }

  resendCode(): void {
    if (this.resendCooldown > 0 || this.resending || !this.email) {
      return;
    }

    this.error = "";
    this.resendSuccess = "";
    this.resending = true;

    this.authService.resendMfa(this.email).subscribe({
      next: (res) => {
        this.resending = false;
        this.resendSuccess = res?.message || "Verification code resent successfully.";
        this.startCooldown();
      },
      error: (err) => {
        this.resending = false;
        this.error = err?.message || "Failed to resend code. Please try again.";
      },
    });
  }

  private startCooldown(): void {
    this.resendCooldown = 60; // 1 minute cooldown
    this.cooldownSubscription?.unsubscribe();

    this.cooldownSubscription = interval(1000)
      .pipe(take(61)) // To include 0
      .subscribe({
        next: () => {
          if (this.resendCooldown > 0) {
            this.resendCooldown--;
          }
        },
        complete: () => {
          this.resendCooldown = 0;
        },
      });
  }

  get canResend(): boolean {
    return this.resendCooldown === 0 && !this.resending && !!this.email;
  }
}
