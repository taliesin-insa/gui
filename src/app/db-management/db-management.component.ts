import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError, map} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AnnotationProgressComponent} from '../annotation-progress/annotation-progress.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'db-management',
  templateUrl: './db-management.component.html',
  styleUrls: ['./db-management.component.scss']
})
export class DbManagementComponent implements OnInit, OnDestroy {

  private handleError: HandleError;
  private isExportInProgress: boolean;
  private isExportInPopUp: boolean;


  constructor(private router: Router,
              private http: HttpClient,
              private annotationProgress: AnnotationProgressComponent,
              private httpErrorHandler: HttpErrorHandler,
              private modalService: NgbModal) {
    this.handleError = httpErrorHandler.createHandleError('DBManagement');
  }

  ngOnInit() {
  }

  /**
   * Gets all the piff files and their image and shows a "save as" dialog to the user
   */
  exportPiFF(inPopUp: boolean) {
    this.isExportInProgress = true;
    this.isExportInPopUp = inPopUp;

    this.http.get('/export/piff', {responseType: 'blob', headers: { skipTimeoutInterceptor: 'true'} })
      .pipe(
        map(response => (response) as Blob),
        catchError(this.handleError('exportPiFF', null)))
      .subscribe(body => {
        this.isExportInProgress = false;
        if (body !== null) {
          // get the response data
          const archiveContent = new Blob([body], {type: 'application/zip'});
          // create a new file from the response data
          const file = document.createElement('a');
          document.body.appendChild(file);
          // create a direct URL linked to the file
          const urlFile = window.URL.createObjectURL(archiveContent);
          file.href = urlFile;
          // set the file default name
          file.download = 'database.zip';
          // fake click on the link, open the 'save as' dialog
          file.click();
          // free URL
          window.URL.revokeObjectURL(urlFile);
        }
      });
  }

  ngOnDestroy() {
    this.httpErrorHandler.clearErrors();
  }

}
