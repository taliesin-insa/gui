import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {ACCOUNTS} from './mock-accounts';
import {Account} from './account';
import {Component, OnInit} from '@angular/core';
import {Account} from './account';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {SessionStorageService} from '../services/session-storage.service';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError} from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'accountmanagement',
  templateUrl: './accountmanagement.component.html',
  styleUrls: ['./accountmanagement.component.scss']
})
export class AccountManagementComponent implements OnInit {

  public accounts: Account[] = [];
  selectedAccount: Account;
  accountForm: FormGroup;
  private newAccount: Account = new Account();

  handleError: HandleError;

  constructor(private formBuilder: FormBuilder,
              private auth: AuthService,
              private session: SessionStorageService,
              private httpErrorHandler: HttpErrorHandler) {
    this.accountForm = this.formBuilder.group({
      name: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl(''),
      role: new FormControl('')
    });

    this.handleError = httpErrorHandler.createHandleError('Account Management');
  }

  ngOnInit() {
    this.auth.accountList(this.session.getToken())
    .pipe(catchError(this.handleError('listing accounts', null)))
    .subscribe(data => {
      for (const item of data.body) {
        console.log(item);
      }
    });
  }

  Delete(account: Account) {
    for (const item of this.accounts) {
      if ( item === account) {
        this.accounts.splice((this.accounts.indexOf(item)), 1);
      }
    }
  }

  onSubmit(values: any) {
    const{name, password, email, role} = values;
    this.newAccount = new Account(name, email, role);
    console.log(this.newAccount);
    this.accounts.push(this.newAccount);
    console.log(this.accounts);
    this.accountForm.reset();
  }

  onSelect(account: Account): void {
    this.selectedAccount = account;
  }

  onCreate() {

  }


}
