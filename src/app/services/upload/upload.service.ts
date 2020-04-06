import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType, HttpRequest, HttpEvent} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {map, retry, concatMap, catchError} from 'rxjs/operators';
import {from} from 'rxjs';
import { HandleError, HttpErrorHandler } from '../http-error-handler.service';

const url = '/import/upload';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  handleError: HandleError;
  progresses: { [key: string]: { subject: Subject<number>, progress: Observable<number> } } = {};

  constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('UploadService');
  }

  private eventCallback(event: HttpEvent<any>, file: File) {
    switch (event.type) {
      case HttpEventType.Sent:
        return `Uploading file "${file.name}" of size ${file.size}.`;
  
      case HttpEventType.UploadProgress:
        // Compute and show the % done:
        const percentDone = Math.round(100 * event.loaded / event.total);
        this.progresses[file.name].subject.next(percentDone);
        return `File "${file.name}" is ${percentDone}% uploaded.`;
  
      case HttpEventType.Response:
        this.progresses[file.name].subject.complete();
        return `File "${file.name}" was completely uploaded!`;
  
      default:
        return `File "${file.name}" unhandled event: ${event.type}.`;
    }
  }

  public upload(files: Set<File>, progresses: { [key: string]: { subject: Subject<number>, progress: Observable<number> } }) {
    // this will be the our resulting map

    this.progresses = progresses;

    from(files).pipe(
      concatMap(file => {
        const data = new FormData();
        data.append('file', file, file.name);

        return this.http.request(new HttpRequest('POST', url, data, {
          reportProgress: true
        })).pipe(retry(2),
                catchError(this.handleError('upload', undefined)),
                map(event => this.eventCallback(event, file)));
      })
    ).subscribe(e => {
        console.log(e);
      },
      error => {
        console.error(error);
    });

  }
}
