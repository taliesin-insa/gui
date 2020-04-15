import {Component, OnInit} from '@angular/core';
import {Account} from './account';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {SessionStorageService} from '../services/session-storage.service';

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

  constructor(private formBuilder: FormBuilder, private auth: AuthService, private session: SessionStorageService) {
    this.accountForm = this.formBuilder.group({
      name: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl(''),
      role: new FormControl('')
    });
  }

  ngOnInit() {
    this.auth.accountList(this.session.getToken()).subscribe(list => {
      for (const item in list) {
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

}
