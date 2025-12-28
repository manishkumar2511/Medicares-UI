import { Component, inject, OnInit } from '@angular/core';
import { PrimematerialModule } from '../../../core/primematerial.module';
import { CommonService } from '../../../core/services/common';
import { State } from '../../../core/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoWhitespaceValidator, passwordMatchValidator, phoneNumberValidator } from '../../../core/validators';
import { FormHelpers } from '../../../core/helpers';
import { FormErrorComponent } from '../../../shared';
import { ToastService } from '../../../core/services';
import { OwnerService } from '../../../core/services/owner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-owner-registration',
  imports: [
    PrimematerialModule,
    FormErrorComponent
  ],
  templateUrl: './owner-registration.component.html',
  styleUrl: './owner-registration.component.scss',
  standalone: true
})
export class OwnerRegistrationComponent implements OnInit {
  private commonService = inject(CommonService);
  private ownerService = inject(OwnerService);   
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  states: State[] = [];
  ownerRegistrationForm!: FormGroup;
  selectedProfileImage: File | null = null;
  readonly FormHelpers = FormHelpers;

  ngOnInit(): void {
    this.loadStates();
    this.initOwnerRegistrationForm();
  }

private initOwnerRegistrationForm(): void {
  this.ownerRegistrationForm = this.fb.group(
    {
      firstName: ['', [Validators.required, NoWhitespaceValidator]],
      lastName: ['', [Validators.required, NoWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phoneNumber: ['', [Validators.required, NoWhitespaceValidator , phoneNumberValidator()]],
      addressLine: ['', [Validators.required, NoWhitespaceValidator]],
      city: ['', [Validators.required, NoWhitespaceValidator]],
      postalCode: ['', [Validators.required, NoWhitespaceValidator]],
      stateId: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );
}


  loadStates() {
    this.commonService.getState().subscribe({
      next: (res: State[]) => {
        this.states = [...res];
      },
    });
  }

  onProfileImageSelected(file: File | null): void {
  this.selectedProfileImage = file;
}

  submitOwnerRegistration(): void {
    if (this.ownerRegistrationForm.invalid) {
      this.ownerRegistrationForm.markAllAsTouched();
      return;
    }

    const payload = this.normalizeOwnerRegistrationData();
    this.ownerService.ownerRegistration(payload).subscribe({
    next: (res) => {
      this.toastService.success(
        'Success',
        'Owner registration completed successfully'
      );

      this.ownerRegistrationForm.reset();
      this.selectedProfileImage = null;
      this.router.navigate(['/account/login']);
    },
    error: () => {
      this.toastService.error(); 
    }
  });

  }

  private normalizeOwnerRegistrationData(): FormData {
  const formValue = this.ownerRegistrationForm.getRawValue();
  const formData = new FormData();

  formData.append('firstName', formValue.firstName || '');
  formData.append('lastName', formValue.lastName || '');
  formData.append('email', formValue.email || '');
  formData.append('password', formValue.password || '');
  formData.append('phoneNumber', formValue.phoneNumber || '');
  formData.append('addressLine', formValue.addressLine || '');
  formData.append('city', formValue.city || '');
  formData.append('postalCode', formValue.postalCode || '');
  formData.append('stateId', formValue.stateId || '');

  if (this.selectedProfileImage) {
    formData.append('profileImage', this.selectedProfileImage);
  }

  return formData;
}

}

