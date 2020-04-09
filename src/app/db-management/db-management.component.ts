import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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
  private annotationRate: number;
  private rejectedNumber: number;
  private totalNbSnippets: number;
  private statusData: any;


  constructor(private router: Router,
              private http: HttpClient,
              httpErrorHandler: HttpErrorHandler,
              private route: ActivatedRoute) {
    this.handleError = httpErrorHandler.createHandleError('DBManagement');
  }

  ngOnInit() {
    // get the data returned by the resolve service
    this.statusData = this.route.snapshot.data.statusData;
    // update variables used
    if (this.statusData !== null && this.statusData.isDBUp && this.statusData.total > 0) {
      this.annotationRate = this.statusData.annotated / (this.statusData.total - this.statusData.unreadable);
      this.rejectedNumber = this.statusData.unreadable;
      this.totalNbSnippets = this.statusData.total;
    } else {
      // values by default is there is no database
      this.annotationRate = 0;
      this.rejectedNumber = 0;
      this.totalNbSnippets = 0;
    }

    console.log(this.annotationRate);
    console.log(this.rejectedNumber);
    console.log(this.totalNbSnippets);
  }

  /**
   * Gets all the piff files and their image and shows a "save as" dialog to the user
   */
  exportPiFF() {
    this.http.get('/export/piff', {responseType: 'blob'})
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
