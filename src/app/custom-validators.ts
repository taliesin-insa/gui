import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {Account} from './model/Account';

export class CustomValidators {

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

  static freeUsernameValidator(accounts: Account[]) {
    return (control: AbstractControl) => {
      const username = control.get('username').value;
      console.log(accounts.find(acc => (acc.username === username)));
      control.get('username').setErrors( {usernameNotFree: (accounts.find(acc => (acc.username === username)) !== undefined) });
    };
  }

  static freeEmailValidator(accounts: Account[]){
    return (control: AbstractControl) => {
      const email = control.get('email').value;
      control.get('email').setErrors({ emailNotFree: (accounts.find(acc => (acc.email === email)) !== undefined) });
    };
  }

}
