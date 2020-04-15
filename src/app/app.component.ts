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
  @ViewChildren('navButton') navButton: QueryList<ElementRef>;

  title = 'taliesin-frontend';
  public isMenuCollapsed = false;

  constructor(public session: SessionStorageService,
              private auth: AuthService,
              private router: Router) {}

  logoutUser() {
    this.auth.logout(this.session.getToken()).subscribe(success => {
      this.updateIndicator();
      this.session.signOut();
      this.router.navigate(['/login']);
    });
  }


  updateIndicator() {
    const nabButtonsArrays = this.navButton.toArray();
    for (const elem of nabButtonsArrays) {
      elem.nativeElement.classList.remove('navbar-highlight');
    }
    document.activeElement.classList.add('navbar-highlight');
  }

  updateSwitch(value: string) {
    switch (value) {
      case 'annotation-nav' :
        document.getElementById('annotation-nav').classList.add('navbar-highlight');
        break;
      case 'dbManagement-nav':
        document.getElementById('dbManagement-nav').classList.add('navbar-highlight');
        break;
    }
  }

  update() {
    if ( sessionStorage.getItem('navbar-highlight') !== 'NULL') {
      const navButtonsArrays = this.navButton.toArray();
      for (const elem of navButtonsArrays) {
        elem.nativeElement.classList.remove('navbar-highlight');
      }
      this.updateSwitch(sessionStorage.getItem('navbar-highlight'));
    }
  }

}
