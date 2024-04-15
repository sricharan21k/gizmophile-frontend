import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Custom validator function to check for special characters
export function validatePasswordMatch(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const password = control.root.get('password')?.value;
    const err: ValidationErrors = { mismatch: true };
    return password === control.value ? null : err;
  };
}
