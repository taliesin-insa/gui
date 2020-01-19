import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

import {Observable, of} from 'rxjs';
import {ErrorMessageService} from './error-messages.service';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError =
  <T> (operation?: string, defaultResult?: T) => (error: HttpErrorResponse) => Observable<T>;

/** Handles HttpClient errors */
@Injectable()
export class HttpErrorHandler {
  constructor(private errorMessageService: ErrorMessageService) {
  }

  /** Create curried handleError function that already knows the service name */
  createHandleError = (serviceName = '') => <T>
  (operation = 'operation', defaultResult = {} as T) => this.handleError(serviceName, operation, defaultResult);

  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   * @param serviceName = name of the data service that attempted the operation
   * @param operation - name of the operation that failed
   * @param defaultResult - optional value to return as the observable result
   */
  handleError<T>(serviceName = '', operation = 'operation', defaultResult = {} as T) {

    return (error: HttpErrorResponse): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      let message;
      switch (error.status) {
        case 404:
          message = `Server or URL not found  (${error.status})`;
          break;
        case 504:
          message = `An internal server error occured, please try again  (${error.status})`;
          break;
        default:
          if ( error.error instanceof ErrorEvent ) {
            message = error.error.message;
          } else {
            message = `server returned code ${error.status} with body "${error.error}"`;
          }
      }

      // TODO: better job of transforming error for user consumption
      this.errorMessageService.add(`${serviceName}: ${operation} failed: ${message}`);

      // Let the app keep running by returning a safe result.
      return of(defaultResult);
    };

  }
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
