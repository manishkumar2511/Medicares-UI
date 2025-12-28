import { AbstractControl, FormGroup } from '@angular/forms';

export class FormHelpers {

  static isFieldInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
  
  static hasConfirmPasswordMismatch(
    form: FormGroup,
    passwordControl: string = 'password',
    confirmPasswordControl: string = 'confirmPassword'
  ): boolean {
    return (
      form.hasError('passwordMismatch') &&
      form.get(confirmPasswordControl)?.touched === true
    );
  }
}
