import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwayComponent } from './away.component';

describe('AwayComponent', () => {
  let component: AwayComponent;
  let fixture: ComponentFixture<AwayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
