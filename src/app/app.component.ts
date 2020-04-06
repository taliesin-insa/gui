import { Router } from '@angular/router';
import {Component, ElementRef, QueryList, ViewChildren} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  title = 'taliesin-frontend';
  @ViewChildren('navButton') navButton: QueryList<ElementRef>;

  onclick() {

    const nabButtonsArrays = this.navButton.toArray();
    for (const elem of nabButtonsArrays) {
      elem.nativeElement.classList.remove('highlight');
      elem.nativeElement.classList.add('lowlight');
    }
    document.activeElement.classList.remove('lowlight');
    document.activeElement.classList.add('highlight');
  }

  update() {
    const nabButtonsArrays = this.navButton.toArray();
    if ( sessionStorage.getItem('highlight') === 'annot') {
      for (const elem of nabButtonsArrays) {
        elem.nativeElement.classList.remove('highlight');
        elem.nativeElement.classList.add('lowlight');
      }
      document.getElementById('annotation').classList.remove('lowlight');
      document.getElementById('annotation').classList.add('highlight');
    } else if ( sessionStorage.getItem('highlight') === 'reco') {
      for (const elem of nabButtonsArrays) {
        elem.nativeElement.classList.remove('highlight');
        elem.nativeElement.classList.add('lowlight');
      }
      document.getElementById('reconnaisseur').classList.remove('lowlight');
      document.getElementById('reconnaisseur').classList.add('highlight');
    } else if ( sessionStorage.getItem('highlight') === 'data') {
      for (const elem of nabButtonsArrays) {
        elem.nativeElement.classList.remove('highlight');
        elem.nativeElement.classList.add('lowlight');
      }
      document.getElementById('database').classList.remove('lowlight');
      document.getElementById('database').classList.add('highlight');
    }
    sessionStorage.clear();
  }
}
