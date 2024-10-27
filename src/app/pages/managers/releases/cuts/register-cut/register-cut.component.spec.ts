import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCutComponent } from './register-cut.component';

describe('RegisterCutComponent', () => {
  let component: RegisterCutComponent;
  let fixture: ComponentFixture<RegisterCutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterCutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterCutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
