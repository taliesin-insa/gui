import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

import {Observable, of} from 'rxjs';
import {ErrorMessageService} from './error-messages.service';
import {ToastService} from '../toast-global/toast-service';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError =
  <T> (operation?: string, defaultResult?: T) => (error: HttpErrorResponse) => Observable<T>;

/** Handles HttpClient errors. Creates user-friendly error messages, that are sent to the ErrorMessageService.
 * Each instance of this class knows the service that failed, and when handling an error, you can also pass the name of the failed function.
 */
@Injectable()
export class HttpErrorHandler {
  constructor(private errorMessageService: ErrorMessageService, private toastService: ToastService) {
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

      this.toastService.showDanger(HttpErrorResponse.toString());

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      let message;
      switch (error.status) {
        case 404:
          message = `Server or URL not found`;
          break;
        case 504:
          message = `Impossible to reach server, timeout occured`;
          break;
        default:
          if ( error.error instanceof ErrorEvent ) {
            message = error.error.message;
          } else {
            message = `Unknown error, with body "${error.error}"`;
          }
      }
      message += ` (${error.status})`;

      // TODO: Change here the way we send errors to the ErrorMessageService
      this.errorMessageService.add(`${serviceName}: ${operation} failed: ${message}`);

      // Let the app keep running by returning a safe result (with a default value defined locally where the error occured).
      return of(defaultResult);
    };

  }
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
