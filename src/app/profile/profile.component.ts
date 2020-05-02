import { Component, OnInit } from '@angular/core';
import {SessionStorageService} from '../services/session-storage.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from '../custom-validators';
import {AuthService} from '../services/auth.service';
import {catchError} from 'rxjs/operators';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private showPwdModif = false;
  private modifyPasswordForm: FormGroup;

  handleError: HandleError;

  constructor(private auth: AuthService,
              private fb: FormBuilder,
              private httpErrorHandler: HttpErrorHandler,
              private session: SessionStorageService) {

    this.modifyPasswordForm = this.fb.group({
        oldPassword: ['', Validators.required],
        password: ['', Validators.compose([
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
        confirmPassword: ['', Validators.required],
      },
      {
        // check whether password and confirm password match
        validators: [CustomValidators.passwordMatchValidator,
          CustomValidators.newPwdOldPwdDiffValidator]
      });

    this.handleError = httpErrorHandler.createHandleError('Profile');
  }

  ngOnInit() {
  }

  modifyPassword(values: any) {
    const {oldPassword, password, confirmPassword} = values;

    this.auth.modifyPassword(this.session.getUsername(), oldPassword, password)
      .pipe(catchError(this.handleError('ModifyPassword', null)))
      .subscribe(() => {
        this.showPwdModif = false;
      });
  }

}
