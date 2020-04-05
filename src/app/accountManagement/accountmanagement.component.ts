import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {ACCOUNTS} from './mock-accounts';
import {Account} from './account';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'accountmanagement',
  templateUrl: './accountmanagement.component.html',
  styleUrls: ['./accountmanagement.component.scss']
})
export class AccountManagementComponent implements OnInit {

  accounts = ACCOUNTS;
  selectedAccount: Account;

  constructor(private router: Router) {  }

  ngOnInit() {
  }

  Delete(account: Account) {
    for (const item of this.accounts) {
      if ( item === account) {
        this.accounts.splice((this.accounts.indexOf(item)), 1);
      }
    }
  }

  onCreate() {

  }

  onSelect(account: Account): void{
    this.selectedAccount = account;
  }

}
