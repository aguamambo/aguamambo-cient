import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterReceiptComponent } from './register-receipt.component';

describe('RegisterReceiptComponent', () => {
  let component: RegisterReceiptComponent;
  let fixture: ComponentFixture<RegisterReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterReceiptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
