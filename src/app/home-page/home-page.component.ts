import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {AppComponent} from '../app.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  constructor(private router: Router, private appComponent: AppComponent) {  }

  ngOnInit() {
  }

  highlight(id: number) {
    sessionStorage.clear();
    if (id === 1) {
      sessionStorage.setItem('highlight', 'annot');
    } else if (id === 2) {
      sessionStorage.setItem('highlight', 'reco');
    } else if (id === 3) {
      sessionStorage.setItem('highlight', 'data');
    }
    this.appComponent.update();
  }
}
