import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UploadService} from '../services/upload/upload.service';
import {forkJoin, from} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient, HttpEventType, HttpEvent, HttpRequest, HttpResponse, HttpUserEvent} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError, map, concatMap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'db-creation',
  templateUrl: './db-creation.component.html',
  styleUrls: ['./db-creation.component.scss']
})
export class DbCreationComponent implements OnInit, OnDestroy {

  dbCreationForm: FormGroup; // Form
  public creationSuccessful = false;

  private acceptedFileTypes = ['image/png', 'image/jpeg'];
  public files: Set<File> = new Set();

  progresses: { [key: string]: { progress: Observable<number>, subject: Subject<number> } };

  @ViewChild('primaryBtn', {static: false}) primaryBtn;
  primaryButtonText = 'Importer';

  public uploadInProgress = false;
  private uploadStarted = false;

  private handleError: HandleError;

  // link referring to the hidden File Input in HTML
  @ViewChild('file', {static: false}) file;


  constructor(private router: Router,
              private uploadService: UploadService,
              private fb: FormBuilder,
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
      if (!isNaN(parseInt(key)) && this.acceptedFileTypes.includes(incomingFiles[key].type)) {
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
    this.uploadStarted = true;
    this.progresses = {};

    this.files.forEach(file => {
      const sub = new Subject<number>();

      this.progresses[file.name] = {
        subject: sub,
        progress: sub.asObservable()
      };
    });

    this.uploadService.upload(this.files, this.progresses);

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
      this.primaryBtn.nativeElement.classList.replace('btn-outline-primary', 'btn-success');
      this.sendImgsToRecognizer();
    });
  }

  sendImgsToRecognizer() {
    this.http.post('/recognizer/sendImgs', null, {})
      .pipe(catchError(this.handleError('sendImgsToReco', undefined)))
      .subscribe();
  }

  ngOnDestroy() {
    this.httpErrorHandler.clearErrors();
  }
}
