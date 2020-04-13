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
        console.log(`Uploading file "${file.name}" of size ${file.size}.`);
        break;
      case HttpEventType.UploadProgress:
        // Compute and show the % done:
        const percentDone = Math.round(100 * event.loaded / event.total);
        this.progresses[file.name].subject.next(percentDone);
        break;
      case HttpEventType.Response:
        this.progresses[file.name].subject.complete();
        break;
      default:
        console.log(`File "${file.name}" unhandled event: ${event.type}.`);
    }

    return file;
  }

  public upload(files: Set<File>, progresses: { [key: string]: { subject: Subject<number>, progress: Observable<number> } }) {
    this.progresses = progresses;

    from(files).pipe(
      // concatMap subscribes to the observables one by one,
      // it does not subscribe to the next observable until the previous completes.
      concatMap(file => {
        const data = new FormData();
        data.append('file', file, file.name);

        // the pipe with the error/callback handlers is done here rather than
        // after the "from(files)" pipe because for various reasons
        // (related to the progress bars) it cannot be done elsewhere
        return this.http.request(new HttpRequest('POST', url, data, {
          reportProgress: true
        })).pipe(retry(2),
                catchError(this.handleError('upload', undefined)),
                map(event => this.eventCallback(event, file)));
      })
    ).toPromise();

  }
}
