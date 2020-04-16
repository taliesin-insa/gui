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
      console.log(element);
    }
  }

  title = 'taliesin-frontend';
  public isMenuCollapsed = false;

  constructor(public session: SessionStorageService,
              private auth: AuthService,
              private router: Router) {
  }

  ngAfterViewInit() {
    // Called in the case where the page is refreshed
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
    if ( currentNavIndicator !== null) { // An item is already highlighted
      document.getElementById(currentNavIndicator).classList.remove('navbar-highlight');
    }
    const elem = document.getElementById(navLinkId);
    if (elem !== null) {
      elem.classList.add('navbar-highlight');
    } else {
      console.log(this.session.getToken());
    }
    this.session.setNavIndicator(navLinkId);
  }

}
