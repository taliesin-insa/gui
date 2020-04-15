import {Component, OnInit} from '@angular/core';
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
export class LoginComponent implements OnInit {

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
      if (this.route.snapshot.paramMap.has('returnUrl')) {
        this.router.navigate([this.route.snapshot.paramMap.get('returnUrl')]);
        this.appComponent.updateNavIndicator(this.route.snapshot.paramMap.get('returnUrl') + '-nav');
        console.log('init login nav return' + this.route.snapshot.paramMap.get('returnUrl'));
      } else {
        this.router.navigate(['/home']);
        this.appComponent.updateNavIndicator('home-nav');
        console.log('init login nav home');
      }
    }
  }

  onSubmit() {
    this.auth.login(this.loginForm)
    .pipe(catchError(this.handleError('authenticating', null)))
    .subscribe(data => {
      this.session.saveToken(data.body.Token);
      this.session.saveUser(data.body);
      this.router.navigate(['/home']);
      sessionStorage.setItem('navbar-highlight', 'home-nav');
    });
  }
}
