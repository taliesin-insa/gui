import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {Account} from './model/Account';
import {AccountManagementComponent} from './account-management/account-management.component';

export class CustomValidators {

  constructor(private accManagement: AccountManagementComponent) {
  }

  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }

  static passwordMatchValidator(control: AbstractControl) {
    const password: string = control.get('password').value; // get password from our password form control
    const confirmPassword: string = control.get('confirmPassword').value; // get password from our confirmPassword form control
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confirmPassword').setErrors({ noPasswordMatch: true });
    }
  }

  static newPwdOldPwdDiffValidator(control: AbstractControl) {
    const oldPassword: string = control.get('oldPassword').value; // get password from our password form control
    const newPassword: string = control.get('password').value; // get password from our confirmPassword form control
    // compare is the password math
    if (oldPassword !== newPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('password').setErrors({ samePasswordAsBefore: true });
    }
  }

}
