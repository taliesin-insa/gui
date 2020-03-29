import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {getIdAndValue, getUnreadableFlag, Snippet} from '../model/Snippet';
import {FormBuilder, FormGroup, Form} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {SessionStorageService} from '../services/session-storage.service';
import {AuthService} from '../services/auth.service';
import {catchError} from 'rxjs/operators';
import {ToastService} from '../toast-global/toast-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm;

  constructor(private router: Router, private session: SessionStorageService, private formBuilder: FormBuilder, private auth: AuthService) {
    this.loginForm = this.formBuilder.group({
      username: '',
      password: '',
    });
  }

  ngOnInit() {
    if (this.session.getToken()) {
      // user is already logged in
      // TODO: redirect to home page
    }
  }

  onSubmit() {
    console.log('submitted');

    this.auth.login(this.loginForm).subscribe(data => {
      console.log(data);
      this.session.saveToken(data.Token);
      this.session.saveUser(data);
    }, err => {
      console.error(err);
    });
  }
}
