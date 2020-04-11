import { Component, OnInit } from '@angular/core';
import { SessionStorageService } from './services/session-storage.service';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'taliesin-frontend';

  constructor(public session: SessionStorageService,
              private auth: AuthService,
              private router: Router) {}

  logout_user() {
    this.auth.logout(this.session.getToken()).subscribe(success => {
      this.session.signOut();
      this.router.navigate(['/login']);
    });
  }
}
