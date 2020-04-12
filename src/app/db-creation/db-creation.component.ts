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
  styleUrls: ['./db-creation.component.scss']
})
export class DbCreationComponent implements OnInit {

  dbCreationForm: FormGroup; // Form
  public creationSuccessful = false;

  public files: Set<File> = new Set();
  progresses: { [key: string]: { progress: Observable<number> } }; // map { filename: string, percentOfUpload: Observable<number> }
  primaryButtonText = 'Importer';
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

  /* ===== UPLOAD PART ===== */

  /**
   * Triggers the click() method of the HTML hidden input. Called when clicking on a button (more user-friendly to use than an input).
   */
  addFiles() {
    this.file.nativeElement.click();
  }

  /**
   * Each time a file is added via the file picker, it is also retrieved and put inside the set of files of the component.
   */
  onFilesAdded() {
    const incomingFiles: { [key: string]: File } = this.file.nativeElement.files;
    for (const key in incomingFiles) {
      // tslint:disable-next-line:radix
      if (!isNaN(parseInt(key))) {
        this.files.add(incomingFiles[key]);
      }
    }
  }

  actionButtonClick() {
    if (this.primaryButtonText === 'Importer') {
      this.upload();
    } else {
      this.router.navigate(['/home']);
    }
  }

  /**
   * Call the UploadService to send every file to the backend. Displays progress bars and stores infos about upload status.
   */
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

    // When all progress-observables are completed...
    forkJoin(allProgressObservables).subscribe(end => {
      // ... and the component is no longer uploading
      this.uploadInProgress = false;

      // The OK-button should have the text "Finish" now
      this.primaryButtonText = 'Terminer';
    });
  }
}
