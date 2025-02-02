import { Component, OnInit } from '@angular/core';
import {ErrorMessageService} from '../services/error-messages.service';

/**
 * Component displaying an alert box each time an error is added inside the ErrorMessageService
 */

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'error-display',
  templateUrl: './error-display.component.html',
  styleUrls: ['./error-display.component.scss']
})
export class ErrorDisplayComponent implements OnInit {

  constructor(private errorMessageService: ErrorMessageService) {
  }

  ngOnInit() {
  }

}
