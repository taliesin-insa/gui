import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomePageComponent} from './home-page/home-page.component';
import {AnnotationComponent} from './annotation/annotation.component';
import {DbManagementComponent} from './db-management/db-management.component';
import {DbCreationComponent} from './db-creation/db-creation.component';
import {AccountManagementComponent} from './accountManagement/accountmanagement.component';

import {HttpClientModule} from '@angular/common/http';
import {HttpErrorHandler} from './services/http-error-handler.service';
import {httpInterceptorProviders} from './http-interceptors';
import { ErrorDisplayComponent } from './error-display/error-display.component';
import {ErrorMessageService} from './services/error-messages.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToastsContainerComponent} from './toast-global/toasts-container.component';
import {LoginComponent} from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    AnnotationComponent,
    DbManagementComponent,
    DbCreationComponent,
    ErrorDisplayComponent,
    LoginComponent,
    ToastsContainerComponent,
    AccountManagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    ErrorMessageService,
    HttpErrorHandler,
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
