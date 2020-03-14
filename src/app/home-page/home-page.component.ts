import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '../toast-global/toast-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  private statusData: any;

  constructor(private router: Router, private route: ActivatedRoute, private toastService: ToastService) { }

  ngOnInit() {
    this.statusData = this.route.snapshot.data.statusData;
    if (this.statusData !== null && this.statusData.isDBUp && this.statusData.total === 0)  {
      this.router.navigate(['/dbCreation']);
    } else if (this.statusData !== null && !this.statusData.isDBUp) {
      this.toastService.showDanger('DB is not up');
    }
  }

}
