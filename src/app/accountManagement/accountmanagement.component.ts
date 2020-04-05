import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {ACCOUNTS} from './mock-accounts';
import {Account} from './account';
import {Component, OnInit} from '@angular/core';
import {ACCOUNTS} from './mock-accounts';
import {Account} from './account';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'accountmanagement',
  templateUrl: './accountmanagement.component.html',
  styleUrls: ['./accountmanagement.component.scss']
})
export class AccountManagementComponent implements OnInit {


  accounts = ACCOUNTS;
  selectedAccount: Account;
  accountForm: FormGroup;
  private newAccount: Account = new Account();

  constructor(private formBuilder: FormBuilder) {
    this.accountForm = this.formBuilder.group({
      name: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl(''),
      role: new FormControl('')
    });
  }

  ngOnInit() {
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
    this.newAccount = new Account(name, password, email, role);
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
