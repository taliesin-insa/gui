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
    if (session.getToken()) {
      if (this.session.getNavIndicator() !== null) {
        this.updateNavIndicator(this.session.getNavIndicator());
      } else {
        this.updateNavIndicator('home-nav');
      }
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
