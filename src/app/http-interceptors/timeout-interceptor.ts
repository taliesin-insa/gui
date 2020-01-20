import {Injectable} from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';

import {Observable, throwError} from 'rxjs';
import {catchError, timeout} from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      timeout(1000),
      catchError(e =>
        throwError(new HttpErrorResponse({
          error: e,
          headers: req.headers,
          status: 504,
          statusText: 'TimeoutError',
          url: req.url
        }))
      )
    );
  }
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
