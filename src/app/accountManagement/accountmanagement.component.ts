import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {Account} from './account';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {SessionStorageService} from '../services/session-storage.service';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

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
  changeAccountForm: FormGroup;
  private newAccount: Account = new Account();

  handleError: HandleError;

  constructor(private formBuilder: FormBuilder,
              private auth: AuthService,
              private session: SessionStorageService,
              private httpErrorHandler: HttpErrorHandler,
              private modalService: NgbModal) {
    this.accountForm = this.formBuilder.group({
      name: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl(''),
      role: new FormControl('')
    });
    this.changeAccountForm = this.formBuilder.group({
      name: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl(''),
      role: new FormControl('')
    });

    this.handleError = httpErrorHandler.createHandleError('Account Management');
  }

  reloadList() {
    this.accounts = [];
    this.accountForm.reset();

    this.auth.accountList(this.session.getToken())
    .pipe(catchError(this.handleError('listing accounts', null)))
    .subscribe(data => {
      for (const item of data.body) {
        this.accounts.push(new Account(item.Username, undefined, item.Role === 0));
      }
    });
  }

  ngOnInit() {
    this.reloadList();
  }

  Delete(account: Account) {

    this.auth.deleteAccount(account.name, this.session.getToken())
    .pipe(catchError(this.handleError('deleting account', null)))
    .subscribe(data => {
      this.reloadList();
    });

  }

  onSubmit(values: any) {
    const{name, password, email, role} = values;

    const roleText = (role) ? 0 : 1;
    this.auth.newAccount(name, password, roleText, this.session.getToken())
      .pipe(catchError(this.handleError('creating account', null)))
      .subscribe(data => {
        this.reloadList();
      });

  }

  onSelect(account: Account): void {
    this.selectedAccount = account;
  }

  onUpdate(values: any) {
    let {name, email, role} = values;
    if (email === null) {
      email = this.selectedAccount.email;
    }
    if (name === null) {
      name = this.selectedAccount.name;
    }
    if (role === null) {
      role = this.selectedAccount.role;
    }
    this.selectedAccount.email = email;
    this.selectedAccount.name = name;
    this.selectedAccount.role = role;
    this.selectedAccount = null;
    this.accountForm.reset();
  }
}
