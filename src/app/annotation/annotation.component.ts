import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.css']
})
export class AnnotationComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

}
