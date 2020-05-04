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

  annotationRate = new BehaviorSubject<number>(0);
  rejectedNumber = new BehaviorSubject<number>(0);
  totalNbSnippets = new BehaviorSubject<number>(0);

  statusDataSubject = new BehaviorSubject<any>(null);
  statusData: any;

  constructor(private route: ActivatedRoute,
              private statusResolverService: StatusResolverService) {
    this.statusDataSubject.subscribe(data => this.statusData = data);
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
      this.annotationRate.next( 100 * this.statusData.annotated / (this.statusData.total - this.statusData.unreadable) );
      this.rejectedNumber.next( this.statusData.unreadable );
      this.totalNbSnippets.next( this.statusData.total );
    } else {
      // values by default if there is no database
      this.annotationRate.next(0);
      this.rejectedNumber.next(0);
      this.totalNbSnippets.next(0);
    }
  }

}
