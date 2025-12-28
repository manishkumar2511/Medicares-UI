import { AbstractControl, ValidationErrors } from '@angular/forms';

export function phoneNumberValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null;
    const valid = /^\d{1,10}$/.test(val);
    return valid ? null : { invalidPhone: true };
  };
}
