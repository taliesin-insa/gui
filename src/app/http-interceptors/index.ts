/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { EnsureHttpsInterceptor } from './ensure-https-interceptor';
import {TimeoutInterceptor} from './timeout-interceptor';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: EnsureHttpsInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true }
];


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
