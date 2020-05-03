import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {Router} from '@angular/router';
import {UploadService} from '../services/upload/upload.service';
import {FormBuilder} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {AppComponent} from '../app.component';

@Component({
  selector: 'app-db-add-examples',
  templateUrl: './db-add-examples.component.html',
  styleUrls: ['./db-add-examples.component.scss']
})
export class DbAddExamplesComponent implements OnInit, OnDestroy {

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
              private httpErrorHandler: HttpErrorHandler,
              public appComponent: AppComponent) {
    this.handleError = httpErrorHandler.createHandleError('DBAddExamples');
  }

  ngOnInit() {
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
      this.appComponent.updateNavIndicator('home-nav');
    }
  }

  /**
   * Call the UploadService to send every file to the backend. Displays progress bars and stores infos about upload status.
   */
  upload() {
    this.uploadInProgress = true;
    this.primaryButtonText = 'Import en cours...';
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

      // The OK-button should have the text "Back to menu" now
      this.primaryButtonText = 'Retour au menu';
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
