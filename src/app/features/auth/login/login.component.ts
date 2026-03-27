import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services';
import { PrimematerialModule } from '../../../core/primematerial.module';
import { FormErrorComponent } from '../../../shared';
import { MESSAGES } from '../../../core/constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PrimematerialModule, FormErrorComponent,RouterLink ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  loading = false;
  showPassword = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.error = '';
    this.loading = true;

    const { email, password } = this.loginForm.value;

    this.authService
      .login({ email, password })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          debugger;
          console.log('Login response:', res);
          if (res.requiresMfa) { //Temporarily skipping 2FA due to SendGrid API key issue in prod env.
            console.log('MFA required, navigating to verify code page', res.requiresMfa);
            this.router.navigate(['/account/verify-code'], { state: { email } });
            return;
          }

          if (res.token) {
            const role = this.authService.getRole()?.toLowerCase();

            if (role === 'superadmin') {
              this.router.navigate(['/super-admin/dashboard']);
            } else {
              this.router.navigate(['/owner-dashboard']);
            }
            return;
          }

          // API logical error
          this.error = res.message || MESSAGES.AUTH.INVALID_CREDENTIALS;
        },
        error: (err) => {
          // err is now the direct response body from ApiService
          this.error = err?.message || err?.messages?.[0] || err?.error?.message || MESSAGES.AUTH.LOGIN_FAILED;
          
          if (this.error === MESSAGES.AUTH.SUBSCRIPTION_REQUIRED) {
            const ownerId = err?.ownerId || err?.error?.ownerId;
            setTimeout(() => {
              this.router.navigate(['/pricing'], { queryParams: { ownerId } });
            }, 3000);
          }
        },
      });
  }


  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
