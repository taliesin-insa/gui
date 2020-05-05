import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError, map} from 'rxjs/operators';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'db-creation',
  templateUrl: './db-creation.component.html',
  styleUrls: ['./db-creation.component.scss']
})
export class DbCreationComponent implements OnInit, OnDestroy {

  dbCreationForm: FormGroup; // Form
  public creationSuccessful = false;

  private handleError: HandleError;

  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('DBCreation');
  }

  ngOnInit() {
    this.dbCreationForm = this.fb.group({dbName: ['', Validators.required]});
  }

  /**
   * First part of creation: initializes the database in the backend
   */
  onSubmit(dbCreationFormData: any) {
    // TODO: change http call to save db name as well
    this.http.post('import/createDB', {}, { observe: 'response' })
      .pipe(
        map(response => response.status === 200),
        catchError(this.handleError('createDB', false)))
      .subscribe(creationStatus => this.creationSuccessful = creationStatus);
  }

  ngOnDestroy() {
    this.httpErrorHandler.clearErrors();
  }
}
