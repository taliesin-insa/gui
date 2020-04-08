/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import {TimeoutInterceptor} from './timeout-interceptor';
import {AuthInterceptor} from './auth-interceptor';

/** Lists all the HttpInterceptors that are used inside this application.
 * An HttpInterceptor intercepts each HTTP request before it is sent, does a specific operation on this request, then pass it to the
 * next HttpInterceptor.
 */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
