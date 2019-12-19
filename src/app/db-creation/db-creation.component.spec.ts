import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbCreationComponent } from './db-creation.component';

describe('DbCreationComponent', () => {
  let component: DbCreationComponent;
  let fixture: ComponentFixture<DbCreationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbCreationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
