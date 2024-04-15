import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Custom validator function to check for special characters
export function validatePasswordStrength(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};

    // Check for at least one number
    if (!/\d/.test(value)) {
      errors['numberRequired'] = true;
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(value)) {
      errors['uppercaseRequired'] = true;
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(value)) {
      errors['lowercaseRequired'] = true;
    }

    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['specialCharRequired'] = true;
    }

    // Check if it contains spaces
    if (/\s/.test(value)) {
      errors['noSpacesAllowed'] = true;
    }

    return Object.keys(errors).length === 0 ? null : errors;
  };
}
