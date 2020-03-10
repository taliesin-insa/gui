import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError, map} from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'db-management',
  templateUrl: './db-management.component.html',
  styleUrls: ['./db-management.component.scss']
})
export class DbManagementComponent implements OnInit {

  private handleError: HandleError;

  constructor(private router: Router,
              private http: HttpClient,
              httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('DBManagement');
  }

  ngOnInit() {
  }

  /**
   * Gets all the piff files and their image and shows a "save as" dialog to the user
   */
  exportPiFF() {
    this.http.get('/export/piff', { responseType : 'blob'})
      .pipe(
        map(response => (response) as Blob),
        catchError(this.handleError('exportPiFF', null)))
      .subscribe(body => {
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

}
