import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UploadService} from '../upload.service';
import {forkJoin} from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'db-creation',
  templateUrl: './db-creation.component.html',
  styleUrls: ['./db-creation.component.css']
})
export class DbCreationComponent implements OnInit {

  // link to the input in html file
  @ViewChild('file', {static: false}) file;
  public files: Set<File> = new Set();
  public uploadInProgress = false;
  primaryButtonText = 'Upload';
  progress;

  constructor(private router: Router, private uploadService: UploadService) {
  }

  ngOnInit() {
  }

  // todo define what this does
  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (const key in files) {
      // tslint:disable-next-line:radix
      if (!isNaN(parseInt(key))) {
        this.files.add(files[key]);
      }
    }
  }

  // triggers the click() method on the html hidden input
  addFiles() {
    this.file.nativeElement.click();
  }

  upload() {
    this.uploadInProgress = true;
    this.progress = this.uploadService.upload(this.files);

    for (const key in this.progress) {
      this.progress[key].progress.subscribe(val => console.log(val));
    }

    // convert the progress map into an array
    const allProgressObservables = [];
    for (const key in this.progress) {
      allProgressObservables.push(this.progress[key].progress);
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
