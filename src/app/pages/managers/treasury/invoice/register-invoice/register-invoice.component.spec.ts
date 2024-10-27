import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterInvoiceComponent } from './register-invoice.component';

describe('RegisterInvoiceComponent', () => {
  let component: RegisterInvoiceComponent;
  let fixture: ComponentFixture<RegisterInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
