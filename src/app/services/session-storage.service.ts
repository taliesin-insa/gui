import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const NAV_INDICATOR_KEY = 'navbar-highlight';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor() { }

  signOut() {
    sessionStorage.clear();
  }

  public saveToken(token: string) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user) {
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser() {
    return JSON.parse(sessionStorage.getItem(USER_KEY));
  }

  public getNavIndicator() {
    return sessionStorage.getItem(NAV_INDICATOR_KEY);
  }

  public setNavIndicator(navLinkId: string) {
    sessionStorage.setItem(NAV_INDICATOR_KEY, navLinkId);
  }
}
