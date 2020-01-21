import { Injectable } from '@angular/core';

/**
 * Global service that collects errors from all the application. Single instance.
 */

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {

  errors;
  nbErrors = 0;

  constructor() {
    this.errors = new Map<number, string>();
  }

  add(message: string) {
    this.errors.set(this.nbErrors, message);
    this.nbErrors++;
  }

  close(key: number) {
    this.errors.delete(key);
  }

  clear() {
    this.errors.clear();
  }
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
