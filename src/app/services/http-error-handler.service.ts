import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

import {Observable, of} from 'rxjs';
import {ErrorMessageService} from './error-messages.service';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError =
  <T> (operation?: string, defaultResult?: T) => (error: HttpErrorResponse) => Observable<T>;

/** Handles HttpClient errors. Creates user-friendly error messages, that are sent to the ErrorMessageService.
 * Each instance of this class knows the service that failed, and when handling an error, you can also pass the name of the failed function.
 */
@Injectable()
export class HttpErrorHandler {
  constructor(private errorMessageService: ErrorMessageService) {
  }

  /** Create curried handleError function that already knows the service name */
  createHandleError = (serviceName = '') => <T>
  (operation = 'operation', defaultResult = {} as T) => this.handleError(serviceName, operation, defaultResult)

  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   * It provides a default value to return in case of error.
   *
   * @param serviceName = name of the data service that attempted the operation
   * @param operation - name of the operation that failed
   * @param defaultResult - optional value to return as the observable result
   */
  handleError<T>(serviceName = '', operation = 'operation', defaultResult = {} as T) {

    return (error: HttpErrorResponse): Observable<T> => {

      let backendError;

      if (error.error instanceof Blob) {
        const reader = new FileReader();
        // tslint:disable-next-line:only-arrow-functions
        reader.onload = function() {
          console.log('HTTP ERROR ==> ' + reader.result);
        };
        reader.readAsText(error.error as Blob);
        backendError = '[MICRO-EXPORT] Blob error';
      } else {
        backendError = error.error;
      }

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      let message;
      switch (error.status) {
        case 401:
          if (serviceName === 'Login') {
            this.errorMessageService.add(`L'identifiant ou le mot de passe est incorrect.`);
            this.errorMessageService.close(this.errorMessageService.nbErrors - 1, 5000);
          }
          if (serviceName === 'AccountManagement') {
            this.errorMessageService.add(`L'identifiant ou l'adresse email est déjà associé à un autre compte.`);
            this.errorMessageService.close(this.errorMessageService.nbErrors - 1, 10000);
          }
          break;
        case 404:
          message = `Server or URL not found (` + error.message + ' // ' + backendError + ')';
          break;
        case 504:
          message = `Impossible to reach server, timeout occurred (` + error.message + ' // ' + backendError + ')';
          break;
        case 500:
          message = 'Internal server error (' + error.message + ' // ' + backendError + ')';
          break;
        case 400:
          message = 'Bad request (' + error.message + ' // ' + backendError + ')';
          break;
        default:
          if ( error.error instanceof ErrorEvent ) {
            message = error.error.message;
          } else {
            message = `Unknown error, with body "${error.error}"`;
          }
      }

      if (!(error.status === 401 && (serviceName === 'Login' || serviceName === 'AccountManagement'))) {
        message += ` (${error.status})`;
        this.errorMessageService.add(`${serviceName}: ${operation} failed: ${message}`);
      }

      // Let the app keep running by returning a safe result (with a default value defined locally where the error occured).
      return of(defaultResult);
    };

  }

  clearErrors() {
    this.errorMessageService.clear();
  }
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
