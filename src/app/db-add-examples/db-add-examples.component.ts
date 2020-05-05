import {Component, OnDestroy, OnInit} from '@angular/core';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';

@Component({
  selector: 'app-db-add-examples',
  templateUrl: './db-add-examples.component.html',
  styleUrls: ['./db-add-examples.component.scss']
})
export class DbAddExamplesComponent implements OnInit, OnDestroy {

  private handleError: HandleError;

  constructor(private httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('DBAddExamples');
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.httpErrorHandler.clearErrors();
  }

}
