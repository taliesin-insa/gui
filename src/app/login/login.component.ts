import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {SessionStorageService} from '../services/session-storage.service';
import {AuthService} from '../services/auth.service';
import {catchError} from 'rxjs/operators';
import {AppComponent} from '../app.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm;
  handleError: HandleError;

  constructor(private route: ActivatedRoute, private router: Router,
              private session: SessionStorageService, private httpErrorHandler: HttpErrorHandler,
              private formBuilder: FormBuilder, private auth: AuthService, private appComponent: AppComponent) {
    this.loginForm = this.formBuilder.group({
      username: '',
      password: '',
    });

    this.handleError = httpErrorHandler.createHandleError('Login');
  }

  ngOnInit() {
    if (this.session.getToken()) {
      // user is already logged in, redirect him to returnUrl or by default to home
      this.navigateAndUpdateNavbar();
    }
  }

  onSubmit() {
    this.auth.login(this.loginForm)
    .pipe(catchError(this.handleError('authenticating', null)))
    .subscribe(data => {
      this.session.saveToken(data.body.Token);
      this.session.saveUser(data.body);
      this.navigateAndUpdateNavbar();
    });
  }

  navigateAndUpdateNavbar() {
    if (this.route.snapshot.queryParamMap.has('returnUrl')) {
      this.router.navigate([this.route.snapshot.queryParamMap.get('returnUrl')]);
      this.session.setNavIndicator(
        this.route.snapshot.queryParamMap.get('returnUrl').replace('/', '') + '-nav'
      );
    } else {
      this.router.navigate(['/home']);
      this.session.setNavIndicator('home-nav');
    }
  }

  ngOnDestroy() {
    this.httpErrorHandler.clearErrors();
  }
}
