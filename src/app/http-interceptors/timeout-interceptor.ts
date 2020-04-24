import {Injectable} from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';

import {EMPTY, Observable, of, throwError} from 'rxjs';
import {catchError, timeout} from 'rxjs/operators';

/**
 * Add a timeout to each request. In case of a TimeoutError, transform it into an HttpErrorResponse, that will be catched inside
 * the HttpErrorHandler service.
 */

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.get('skipTimeoutInterceptor')) {
      return next.handle(req);
    } else {
      return next.handle(req).pipe(
        timeout(15000),
        catchError(e => {
            if (e.name === 'TimeoutError') {
              e = new HttpErrorResponse({
                error: e,
                headers: req.headers,
                status: 504,
                statusText: 'TimeoutError',
                url: req.url
              });
            }
            return throwError(e);
          }
        )
      );
    }
  }
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
