import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function requireUsernameOrEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const username = control.get('username')?.value;
    const email = control.get('email')?.value;

    // Check if both username and email are empty
    if (!username && !email) {
      // Return error if both fields are empty
      return { requireUsernameOrEmail: true };
    }

    // Return null if no validation errors
    return null;
  };
}
