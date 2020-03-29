import { Component } from '@angular/core';
import {SessionStorageService} from './services/session-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'taliesin-frontend';

  constructor(public session: SessionStorageService) {}

  logout() {
    this.session.signOut();
  }
}
