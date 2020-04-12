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

  constructor(public session: SessionStorageService,
              private auth: AuthService,
              private router: Router) {}

  logout_user() {
    this.auth.logout(this.session.getToken()).subscribe(success => {
      this.session.signOut();
      this.router.navigate(['/login']);
    });
  }
  @ViewChildren('navButton') navButton: QueryList<ElementRef>;

  updateIndicator() {

    const nabButtonsArrays = this.navButton.toArray();
    for (const elem of nabButtonsArrays) {
      elem.nativeElement.classList.replace('highlight', 'lowlight');
    }
    document.activeElement.classList.replace('lowlight', 'highlight');
  }

  updateSwitch(value: string) {
    switch (value) {
      case 'annot' :
        document.getElementById('annotation').classList.replace('lowlight', 'highlight');
        break;
      /*case 'reco':
        document.getElementById('recognizer').classList.replace('lowlight', 'highlight');
        break;*/
      case 'data':
        document.getElementById('database').classList.replace('lowlight', 'highlight');
        break;
    }
  }

  update() {
    if ( sessionStorage.getItem('highlight') !== 'NULL') {
      const navButtonsArrays = this.navButton.toArray();
      for (const elem of navButtonsArrays) {
        elem.nativeElement.classList.replace('highlight', 'lowlight');
      }
      this.updateSwitch(sessionStorage.getItem('highlight'));
    }
  }

}
