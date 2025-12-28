import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.scss']
})
export class FormErrorComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) controlName!: string;

  @Input() requiredMessage?: string;
  @Input() invalidMessage?: string;
  @Input() passwordMismatchMessage?: string;
  @Input() minLengthMessage?: string;
  @Input() maxLengthMessage?: string;

  shouldShowError(): boolean {
    const control = this.form.get(this.controlName);

    if (!control) return false;

    // Show error if field is invalid AND touched OR dirty OR form submitted
    if (control.invalid && (control.touched || control.dirty)) return true;

    // Special case: password mismatch (form-level validator)
    if (this.controlName === 'confirmPassword' && this.form.hasError('passwordMismatch')) {
      return true;
    }

    return false;
  }
}
