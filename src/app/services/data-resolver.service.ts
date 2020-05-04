import {Injectable} from '@angular/core';
import {Resolve, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {map, catchError} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from './http-error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class StatusResolverService implements Resolve <Observable<any>> {

  private readonly handleError: HandleError;

  constructor(private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('StatusResolverService');
  }

  // automatically called before loading the component
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.getDBStatusRequest();
  }

  private getDBStatusRequest() {
    return this.http.get('/db/status')
      .pipe(
        catchError(this.handleError('resolve', null))
      );
  }

  getDBStatus() {
    let res = null;
    this.getDBStatusRequest().subscribe(data => {
      res = data;
    });
    return res;
  }
}
