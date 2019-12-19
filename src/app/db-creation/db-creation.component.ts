import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'db-creation',
  templateUrl: './db-creation.component.html',
  styleUrls: ['./db-creation.component.css']
})
export class DbCreationComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

}
