import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Snippet} from '../model/Snippet';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.css']
})
export class AnnotationComponent implements OnInit {

  snippets: Snippet[];

  constructor(private router: Router) {
  }

  ngOnInit() {
  }
}
