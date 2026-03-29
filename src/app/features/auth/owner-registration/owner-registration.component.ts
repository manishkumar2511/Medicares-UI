import { Component, inject, OnInit } from '@angular/core';
import { PrimematerialModule } from '../../../core/primematerial.module';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { passwordMatchValidator } from '../../../core/validators';
import { FormHelpers } from '../../../core/helpers';
import { FormErrorComponent } from '../../../shared';
import { ToastService } from '../../../core/services';
import { MESSAGES } from '../../../core/constants';
import { OwnerService } from '../../../core/services/owner';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-owner-registration',
  imports: [
    PrimematerialModule,
    ReactiveFormsModule,
    FormErrorComponent,
    RouterLink
  ],
  templateUrl: './owner-registration.component.html',
  styleUrl: './owner-registration.component.scss',
  standalone: true
})
export class OwnerRegistrationComponent implements OnInit {
  private ownerService = inject(OwnerService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  ownerRegistrationForm!: FormGroup;
  error = '';
  readonly FormHelpers = FormHelpers;

  ngOnInit(): void {
    this.initOwnerRegistrationForm();
  }

  private initOwnerRegistrationForm(): void {
    this.ownerRegistrationForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  submitOwnerRegistration(): void {
    this.error = '';
    if (this.ownerRegistrationForm.invalid) {
      this.ownerRegistrationForm.markAllAsTouched();
      return;
    }

    const formValue = this.ownerRegistrationForm.getRawValue();
    const payload = {
      email: formValue.email,
      password: formValue.password
    };

    this.ownerService.ownerRegistration(payload).subscribe({
      next: (res) => {
        this.toastService.success(
          'Success',
          MESSAGES.AUTH.REGISTRATION_SUCCESS
        );

        this.ownerRegistrationForm.reset();
        this.router.navigate(['/payment-management/payment-billing'], { queryParams: { plan: 'Basic', ownerId: res.data } });
      },
      error: (err) => {
        this.error = Array.isArray(err.messages) ? err.messages[0] : (err.message || 'Registration failed');
      }
    });
  }
}
