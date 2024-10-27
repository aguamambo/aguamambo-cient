import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterSuspensionComponent } from './register-suspension.component';

describe('RegisterSuspensionComponent', () => {
  let component: RegisterSuspensionComponent;
  let fixture: ComponentFixture<RegisterSuspensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterSuspensionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterSuspensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
