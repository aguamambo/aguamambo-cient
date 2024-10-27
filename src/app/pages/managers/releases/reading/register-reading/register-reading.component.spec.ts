import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterReadingComponent } from './register-reading.component';

describe('RegisterReadingComponent', () => {
  let component: RegisterReadingComponent;
  let fixture: ComponentFixture<RegisterReadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterReadingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterReadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
