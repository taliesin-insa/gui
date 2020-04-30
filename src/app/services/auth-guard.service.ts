import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import {catchError, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import { of } from 'rxjs';

import { SessionStorageService } from './session-storage.service';
import { DbManagementComponent } from '../db-management/db-management.component';
import { DbCreationComponent } from '../db-creation/db-creation.component';
import { DbAddExamplesComponent } from '../db-add-examples/db-add-examples.component';
import {AccountManagementComponent} from '../account-management/account-management.component';

const PRIVILEGED_COMPONENTS = [DbManagementComponent, DbCreationComponent, DbAddExamplesComponent, AccountManagementComponent];

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
                    // check permissions
                    // if admin or not privileged component
                    return e.body.Role === 0 || PRIVILEGED_COMPONENTS.find(elt => elt === route.component) == null;
                } else {
                    return false;
                }
            }), catchError(error => {
                console.error(error);
                this.session.signOut();
                this.router.navigate(['/login']);
                return of(false);
            }));
        } else {
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return of(false);
        }
    }
}
