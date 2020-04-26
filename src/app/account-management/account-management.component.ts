import {Component, OnInit} from '@angular/core';
import {Account} from '../model/Account';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
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

  newAccountForm: FormGroup;
  changeAccountForm: FormGroup;

  handleError: HandleError;

  constructor(private formBuilder: FormBuilder,
              private auth: AuthService,
              private session: SessionStorageService,
              private httpErrorHandler: HttpErrorHandler,
              private modalService: NgbModal) {

    this.newAccountForm = this.formBuilder.group({
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

  ngOnInit() {
    this.reloadAccountList();
  }

  reloadAccountList() {
    this.accounts = [];
    this.newAccountForm.reset();

    this.auth.accountList(this.session.getToken())
    .pipe(catchError(this.handleError('listing accounts', null)))
    .subscribe(data => {
      for (const item of data.body) {
        this.accounts.push(new Account(item.Username, undefined, item.Role === 0));
      }
    });
  }

  deleteAccount(account: Account) {
    this.auth.deleteAccount(account.name, this.session.getToken())
    .pipe(catchError(this.handleError('deleting account', null)))
    .subscribe(data => {
      this.reloadAccountList();
    });
  }

  createNewAccount(values: any) {
    const {name, password, email, role} = values;

    const roleText = (role) ? 0 : 1;
    this.auth.newAccount(name, password, roleText, this.session.getToken())
      .pipe(catchError(this.handleError('creating account', null)))
      .subscribe(data => {
        this.reloadAccountList();
      });
  }

  updateSelectedAccount(values: any) {
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

    const roleText = (role) ? 0 : 1;
    this.auth.modifyAccount(name, roleText, this.session.getToken())
      .pipe(catchError(this.handleError('modifying account', null)))
      .subscribe(data => {
        this.reloadAccountList();
      });

    this.selectedAccount.email = email;
    this.selectedAccount.name = name;
    this.selectedAccount.role = role;
    this.selectedAccount = null;

    this.newAccountForm.reset();
  }
}
