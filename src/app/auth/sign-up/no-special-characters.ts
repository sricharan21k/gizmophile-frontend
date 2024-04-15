import { AbstractControl, ValidatorFn } from '@angular/forms';

// Custom validator function to check for special characters
export function noSpecialCharactersValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (value && /[^\w]/.test(value)) {
      return { specialCharacters: true }; // Return validation error if special characters are found
    }
    return null; // Return null if validation passes
  };
}
