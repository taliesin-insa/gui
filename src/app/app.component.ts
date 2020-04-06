import { Router } from '@angular/router';
import {Component, ElementRef, QueryList, ViewChildren} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'taliesin-frontend';
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
      case 'reco':
        document.getElementById('recognizer').classList.replace('lowlight', 'highlight');
        break;
      case 'data':
        document.getElementById('database').classList.replace('lowlight', 'highlight');
        break;
    }
  }

  update() {
    if ( sessionStorage.getItem('highlight') !== null) {
      const navButtonsArrays = this.navButton.toArray();
      for (const elem of navButtonsArrays) {
        elem.nativeElement.classList.replace('highlight', 'lowlight');
      }
      this.updateSwitch(sessionStorage.getItem('highlight'));
    }
  }

}
