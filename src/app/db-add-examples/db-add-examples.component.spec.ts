import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbAddExamplesComponent } from './db-add-examples.component';

describe('DbAddExamplesComponent', () => {
  let component: DbAddExamplesComponent;
  let fixture: ComponentFixture<DbAddExamplesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbAddExamplesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbAddExamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
