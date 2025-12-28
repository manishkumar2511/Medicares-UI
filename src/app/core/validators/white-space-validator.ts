import { AbstractControl, ValidationErrors } from "@angular/forms";

export function NoWhitespaceValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (control.value && control.value.trim().length === 0) {
    return { whitespace: true };
  }
  return null;
}