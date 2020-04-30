import {Component, OnInit} from '@angular/core';
import {Account} from '../model/Account';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {SessionStorageService} from '../services/session-storage.service';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'account-management',
  templateUrl: './account-management.component.html',
  styleUrls: ['./account-management.component.scss']
})
export class AccountManagementComponent implements OnInit {

  public accounts: Account[] = [];

  selectedAccount: Account;

  newAccForm: FormGroup;
  changeAccForm: FormGroup;

  handleError: HandleError;

  constructor(private fb: FormBuilder,
              private auth: AuthService,
              private session: SessionStorageService,
              private httpErrorHandler: HttpErrorHandler,
              private modalService: NgbModal) {

    this.newAccForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.compose([Validators.email, Validators.required])],
      password: ['', Validators.compose([
        // 1. Password Field is Required
        Validators.required,
        // 2. check whether the entered password has a number
        CustomValidators.patternValidator(/\d/, { hasNumber: true }),
        // 3. check whether the entered password has upper case letter
        CustomValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        // 4. check whether the entered password has a lower-case letter
        CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
        // 5. check whether the entered password has a special character
        CustomValidators.patternValidator(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { hasSpecialCharacters: true }),
        // 6. Has a minimum length of 8 characters
        Validators.minLength(8)])
      ],
      confirmPassword: ['', Validators.required],
      role: ['']
    },
    {
      // check whether password and confirm password match
      validators: [CustomValidators.passwordMatchValidator]
        // CustomValidators.freeUsernameValidator(this.accounts),
        // CustomValidators.freeEmailValidator(this.accounts)]
    });

    this.changeAccForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.compose([Validators.email, Validators.required])],
      role: ['']
    });

    this.handleError = httpErrorHandler.createHandleError('AccountManagement');
  }

  ngOnInit() {
    this.reloadAccountList();
  }

  reloadAccountList() {
    this.accounts = [];
    this.newAccForm.reset();

    this.auth.accountList(this.session.getToken())
    .pipe(catchError(this.handleError('listing accounts', null)))
    .subscribe(data => {
      if (data !== null) {
        for (const item of data.body) {
          this.accounts.push(new Account(item.Username, item.Email, item.Role === 0));
        }
      }
    });
  }

  deleteAccount(account: Account) {
    this.auth.deleteAccount(account.username, this.session.getToken())
    .pipe(catchError(this.handleError('deleting account', null)))
    .subscribe(() => {
      this.selectedAccount = null;
      this.reloadAccountList();
    });
  }

  createNewAccount(values: any) {
    const {username, email, password, confirmPassword, role} = values;
    const roleAsNumber = (role) ? 0 : 1;

    this.auth.newAccount(username, email, password, roleAsNumber, this.session.getToken())
      .pipe(catchError(this.handleError('creating account', null)))
      .subscribe(() => {
        this.reloadAccountList();
      });
  }

  updateSelectedAccount(values: any) {
    let {username, email, role} = values;
    if (username === null) {
      username = this.selectedAccount.username;
    }
    if (email === null) {
      email = this.selectedAccount.email;
    }
    if (role === null) {
      role = this.selectedAccount.role;
    }
    const roleAsNumber = (role) ? 0 : 1;

    this.auth.modifyAccount(username, email, roleAsNumber, this.session.getToken())
      .pipe(catchError(this.handleError('modifying account', null)))
      .subscribe(() => {
        this.selectedAccount = null;
        this.reloadAccountList();
      });
  }
}

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

  // static freeUsernameValidator(accounts: Account[]): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const username = control.get('username').value;
  //     return { usernameNotFree: (accounts.find(acc => (acc.username === username)) !== undefined) };
  //   };
  // }
  //
  // static freeEmailValidator(accounts: Account[]): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const email = control.get('email').value;
  //     return { emailNotFree: (accounts.find(acc => (acc.email === email)) !== undefined) };
  //   };
  // }

}
