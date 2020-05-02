import {Component, OnInit} from '@angular/core';
import {Account} from '../model/Account';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {SessionStorageService} from '../services/session-storage.service';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CustomValidators} from '../custom-validators';

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
        username: [null, Validators.compose([
          Validators.required,
          CustomValidators.patternValidator(/^[^!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/, {hasSpecialChars: true})])
        ],
        email: [null, Validators.compose([Validators.email, Validators.required])],
        password: [null, Validators.compose([
          // 1. Password Field is Required
          Validators.required,
          // 2. check whether the entered password has a number
          CustomValidators.patternValidator(/\d/, {noNumber: true}),
          // 3. check whether the entered password has upper case letter
          CustomValidators.patternValidator(/[A-Z]/, {noCapitalCase: true}),
          // 4. check whether the entered password has a lower-case letter
          CustomValidators.patternValidator(/[a-z]/, {noSmallCase: true}),
          // 5. check whether the entered password has a special character
          CustomValidators.patternValidator(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {noSpecialChars: true}),
          // 6. Has a minimum length of 8 characters
          Validators.minLength(8)])
        ],
        confirmPassword: [null, Validators.required],
        role: [null]
      },
      {
        // check whether password and confirm password match
        validator: CustomValidators.passwordMatchValidator
      });

    this.changeAccForm = this.fb.group({
      email: [null, Validators.compose([Validators.email, Validators.required])],
      role: [null]
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
    let {email, role} = values;
    console.log(values);
    if (email === null) {
      email = this.selectedAccount.email;
    }
    if (role === null) {
      role = this.selectedAccount.role;
    }
    const roleAsNumber = (role) ? 0 : 1;

    this.auth.modifyAccount(this.selectedAccount.username, email, roleAsNumber, this.session.getToken())
      .pipe(catchError(this.handleError('modifying account', null)))
      .subscribe(() => {
        this.selectedAccount = null;
        this.reloadAccountList();
      });
  }
}
