import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './services/auth.service';
import {catchError, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import { of } from 'rxjs';

import { SessionStorageService } from './services/session-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    loggedIn = false;

    constructor(
        private router: Router,
        private session: SessionStorageService,
        private auth: AuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

        if (this.session.getToken()) {
            return this.auth.verify(this.session.getToken()).pipe(map(e => {
                if (e) {
                    console.log(e);
                    return true;
                }
            }), catchError(() => {
                this.session.signOut();
                this.router.navigate(['/login']);
                return of(false);
            }));
            /*// logged in so return true
            return this.auth.verify(this.session.getToken()).subscribe(success => {
                    return true;
                }, err => {
                // invalid token, redirect to login by erasing token (=> guard)
                    console.log(err);
                    this.session.signOut();
                    return false;
            });*/
        } else {
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return of(false);
        }
    }
}
