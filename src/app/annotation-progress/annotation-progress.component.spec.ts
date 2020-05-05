import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationProgressComponent } from './annotation-progress.component';

describe('AnnotationProgressComponent', () => {
  let component: AnnotationProgressComponent;
  let fixture: ComponentFixture<AnnotationProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
