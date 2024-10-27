import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CutsComponent } from './cuts.component';

describe('CutsComponent', () => {
  let component: CutsComponent;
  let fixture: ComponentFixture<CutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CutsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
