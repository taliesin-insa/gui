import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UploadService} from '../services/upload/upload.service';
import {forkJoin, Observable} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError, map} from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'db-creation',
  templateUrl: './db-creation.component.html',
  styleUrls: ['./db-creation.component.css']
})
export class DbCreationComponent implements OnInit {

  dbCreationForm: FormGroup; // Form
  public creationSuccessful = false;

  public files: Set<File> = new Set();
  progresses: { [key: string]: { progress: Observable<number> } }; // map { filename: string, percentOfUpload: Observable<number> }
  primaryButtonText = 'Upload';
  public uploadInProgress = false;

  private handleError: HandleError;

  // link referring to the hidden File Input in HTML
  @ViewChild('file', {static: false}) file;


  constructor(private router: Router,
              private uploadService: UploadService,
              private fb: FormBuilder,
              private http: HttpClient,
              httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('DBCreation');
  }

  ngOnInit() {
    this.dbCreationForm = this.fb.group({dbName: ['', Validators.required]});
  }


  onSubmit(dbCreationFormData: any) {
    // TODO: change http call to save db name as well
    this.http.post('import/createDB', {}, { observe: 'response' })
      .pipe(
        map(response => response.status === 200),
        catchError(this.handleError('createDB', false)))
      .subscribe(creationStatus => this.creationSuccessful = creationStatus);
  }

  // todo define what this does
  onFilesAdded() {
    const incomingFiles: { [key: string]: File } = this.file.nativeElement.files;
    for (const key in incomingFiles) {
      // tslint:disable-next-line:radix
      if (!isNaN(parseInt(key))) {
        this.files.add(incomingFiles[key]);
      }
    }
  }

  // triggers the click() method on the html hidden input
  addFiles() {
    this.file.nativeElement.click();
  }

  upload() {
    this.uploadInProgress = true;
    this.progresses = this.uploadService.upload(this.files);

    console.log(this.progresses);

    for (const key in this.progresses) {
      this.progresses[key].progress.subscribe(val => console.log(val));
    }

    // convert the progress map into an array
    const allProgressObservables = [];
    for (const key in this.progresses) {
      allProgressObservables.push(this.progresses[key].progress);
    }

    // Adjust the state variables

    // The OK-button should have the text "Finish" now
    this.primaryButtonText = 'Finish';

    // When all progress-observables are completed...
    forkJoin(allProgressObservables).subscribe(end => {
      // ... and the component is no longer uploading
      this.uploadInProgress = false;
    });
  }
}
