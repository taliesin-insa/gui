import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import {ErrorMessageService} from '../services/error-messages.service';
import {AppComponent} from '../app.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  private statusData: any;

  // tslint:disable-next-line:max-line-length
  constructor(private router: Router, private route: ActivatedRoute, private errorMessageService: ErrorMessageService, private appComponent: AppComponent) {
  }

  ngOnInit() {
    this.statusData = this.route.snapshot.data.statusData;
    if (this.statusData !== null && this.statusData.isDBUp && this.statusData.total === 0)  {
      this.router.navigate(['/dbCreation']);
    } else if (this.statusData !== null && !this.statusData.isDBUp) {
      this.errorMessageService.add(`Snippets database is not available`);
    }
  }
}
