import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType, HttpRequest, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {HandleError, HttpErrorHandler} from '../http-error-handler.service';
import {catchError, map} from 'rxjs/operators';
import { error } from 'protractor';

const url = '/import/upload';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private handleError: HandleError;

  constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('UploadService');
  }

  public upload(files: Set<File>): { [key: string]: { progress: Observable<number> } } {
    // this will be the our resulting map
    const status: { [key: string]: { progress: Observable<number>, hasError: Observable<string> } } = {};

    files.forEach(file => {
      // create a new multipart-form for every file
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);

      // create a http-post request and pass the form
      // tell it to report the upload progress
      const req = new HttpRequest('POST', url, formData, {
        reportProgress: true});

      // create a new progress-subject for every file
      const progress = new Subject<number>();
      const hasError = new Subject<string>();
      hasError.next('info');

      // send the http-request and subscribe for progress-updates

      const startTime = new Date().getTime();
      this.http.request(req)
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          // calculate the progress percentage

          const percentDone = Math.round((100 * event.loaded) / event.total);
          // pass the percentage into the progress-stream
          progress.next(percentDone);
        } else if (event instanceof HttpResponse) {
          // Close the progress-stream if we get an answer from the API
          // The upload is complete
          progress.complete();
          hasError.next('success');
        }
      },
      err => {
        if (err.status !== 200) {
          this.handleError('Uploading of file ' + file.name)(err);
          hasError.next('danger');
        }
      });

      // Save every progress-observable in a map of all observables
      status[file.name] = {
        progress: progress.asObservable(),
        hasError: hasError.asObservable()
      };
    });

    // return the map of progress.observables
    return status;
  }
}
