import { Router } from '@angular/router';
import {Component, ElementRef, QueryList, ViewChildren} from '@angular/core';
import { SessionStorageService } from './services/session-storage.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'taliesin-frontend';
  public isMenuCollapsed = false;

  constructor(public session: SessionStorageService,
              private auth: AuthService,
              private router: Router) {
      // Called in the case where the page is refreshed
      if (session.getToken() && this.session.getNavIndicator() !== null) {
        document.getElementById('home-nav').classList.remove('navbar-highlight');
        document.getElementById(this.session.getNavIndicator()).classList.add('navbar-highlight');
      }
  }

  logoutUser() {
    this.auth.logout(this.session.getToken()).subscribe(success => {
      this.session.signOut();
      this.router.navigate(['/login']);
    });
  }

  updateNavIndicator(navLinkId: string) {
    const currentNavIndicator = this.session.getNavIndicator();
    if ( currentNavIndicator !== null) {
      document.getElementById(currentNavIndicator).classList.remove('navbar-highlight');
    }
    const elem = document.getElementById(navLinkId);
    if (elem !== null) {
      elem.classList.add('navbar-highlight');
    }
    this.session.setNavIndicator(navLinkId);
  }

}
