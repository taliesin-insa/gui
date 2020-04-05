import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {AppComponent} from '../app.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'accountmanagement',
  templateUrl: './accountmanagement.component.html',
  styleUrls: ['./accountmanagement.component.scss']
})
export class AccountManagementComponent implements OnInit {
  @ViewChildren('navButton') navButton: QueryList<ElementRef>;

  constructor(private router: Router) {  }

  ngOnInit() {
  }


  highlight(id: number) {
    console.log(this.navButton);
    const nabButtonsArrays = this.navButton.toArray();
    for (const elem of nabButtonsArrays) {
      elem.nativeElement.classList.remove('highlight');
      elem.nativeElement.classList.add('lowlight');
    }
    if (id === 1 || id === 2 || id === 3) {
      nabButtonsArrays[id].nativeElement.classList.remove('highlight');
      nabButtonsArrays[id].nativeElement.classList.add('lowlight');
    }
  }

}
