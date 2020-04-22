import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  observe: 'response'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(credentials): Observable<any> {
    return this.http.post('/auth/login', {
      username: credentials.value.username,
      password: credentials.value.password
    }, { observe: 'response', headers: new HttpHeaders({'Content-Type': 'application/json'}) });
  }

  logout(token): Observable<any> {
    return this.http.post('/auth/logout', {
      Token: token,
    }, { observe: 'response', headers: new HttpHeaders({'Content-Type': 'application/json'}) });
  }

  verify(token): Observable<any> {
    return this.http.post('/auth/verifyToken', {
      Token: token,
    }, { observe: 'response', headers: new HttpHeaders({'Content-Type': 'application/json'}) });
  }

  accountList(token): Observable<any> {
    return this.http.post('/auth/account/list', {
      Token: token,
    }, { observe: 'response', headers: new HttpHeaders({'Content-Type': 'application/json'}) });
  }

  newAccount(username, password, role, token): Observable<any> {
    return this.http.post('/auth/account/create', {
      AdminToken: token,
      Username: username,
      Password: password,
      Role: role
    }, { observe: 'response', headers: new HttpHeaders({'Content-Type': 'application/json'}) });
  }

  modifyAccount(username, role, token): Observable<any> {
    return this.http.post('/auth/account/modify', {
      AdminToken: token,
      Username: username,
      Role: role
    }, { observe: 'response', headers: new HttpHeaders({'Content-Type': 'application/json'}) });
  }

  deleteAccount(username, token): Observable<any> {
    return this.http.post('/auth/account/delete', {
      AdminToken: token,
      Username: username,
    }, { observe: 'response', headers: new HttpHeaders({'Content-Type': 'application/json'}) });
  }
}
