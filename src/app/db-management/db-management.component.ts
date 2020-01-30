import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'db-management',
  templateUrl: './db-management.component.html',
  styleUrls: ['./db-management.component.scss']
})
export class DbManagementComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

}
