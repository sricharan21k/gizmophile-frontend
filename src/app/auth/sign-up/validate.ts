import {
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of, switchMap, timer, map } from 'rxjs';

export const validatePasswordMatch: AsyncValidatorFn = (
  control: AbstractControl
): Observable<ValidationErrors | null> => {
  if (!control) {
    return of(null);
  }
  return control.valueChanges.pipe(
    switchMap(() =>
      timer(300).pipe(
        map(() => {
          const password = control.root.get('password')?.value;
          const err: ValidationErrors = { mismatch: true };
          return password === control.value ? null : err;
        })
      )
    )
  );
};
