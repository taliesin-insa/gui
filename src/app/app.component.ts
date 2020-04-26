import { Router } from '@angular/router';
import {AfterViewInit, Component, ViewChild} from '@angular/core';
import { SessionStorageService } from './services/session-storage.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('navbarItems', {static: false}) set navbarItems(element) {
    if (element) {
      // After login
      this.refreshNavIndicator();
    }
  }

  title = 'taliesin-frontend';
  public isMenuCollapsed = false;

  constructor(public session: SessionStorageService,
              private auth: AuthService,
              private router: Router) {
  }

  ngAfterViewInit() {
    // If the user presses F5
    this.refreshNavIndicator();
  }

  refreshNavIndicator() {
    if (this.session.getToken() && this.session.getNavIndicator() !== null) {
      const elem = document.getElementById(this.session.getNavIndicator());
      if (elem !== null) {
        elem.classList.add('navbar-highlight');
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
    if ( currentNavIndicator !== null && currentNavIndicator !== 'null' ) { // An item is already highlighted
      const oldElem = document.getElementById(currentNavIndicator);
      if (oldElem !== null) {
        oldElem.classList.remove('navbar-highlight');
      }
    }
    const newElem = document.getElementById(navLinkId);
    if (newElem !== null) {
      newElem.classList.add('navbar-highlight');
    }
    this.session.setNavIndicator(navLinkId);
  }

}
