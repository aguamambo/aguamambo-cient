import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherPaymentsComponent } from './other-payments.component';

describe('OtherPaymentsComponent', () => {
  let component: OtherPaymentsComponent;
  let fixture: ComponentFixture<OtherPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OtherPaymentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtherPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
