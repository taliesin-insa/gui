import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
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
    }, httpOptions);
  }

  verify(token): Observable<any> {
    return this.http.post('/auth/verifyToken', {
      Token: token,
    }, httpOptions);
  }

}
