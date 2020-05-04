import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {StatusResolverService} from '../services/data-resolver.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'annotation-progress',
  templateUrl: './annotation-progress.component.html',
  styleUrls: ['./annotation-progress.component.scss']
})
export class AnnotationProgressComponent implements OnInit {

  annotationRate: number;
  rejectedNumber: number;
  totalNbSnippets: number;

  statusDataSubject = new BehaviorSubject<any>(null);
  statusData: any;

  constructor(private route: ActivatedRoute,
              private statusResolverService: StatusResolverService) {
    this.statusDataSubject.subscribe(data => {
      console.log(data);
      this.statusData = data;
    });
  }

  ngOnInit() {
    // get the data returned by the resolve service
    this.statusDataSubject.next(this.route.snapshot.data.statusData);
    // update variables used
    this.updateProgress();
  }

  reloadDBStatus() {
    this.statusResolverService.getDBStatusRequest().subscribe(data => {
      this.statusDataSubject.next(data);
      this.updateProgress();
    });
  }

  private updateProgress() {
    // update variables used
    if (this.statusData !== null && this.statusData.isDBUp && this.statusData.total > 0) {
      this.annotationRate = ( 100 * this.statusData.annotated / (this.statusData.total - this.statusData.unreadable) );
      this.rejectedNumber = this.statusData.unreadable;
      this.totalNbSnippets = this.statusData.total;
    } else {
      // values by default if there is no database
      this.annotationRate = 0;
      this.rejectedNumber = 0;
      this.totalNbSnippets = 0;
    }
  }

}
