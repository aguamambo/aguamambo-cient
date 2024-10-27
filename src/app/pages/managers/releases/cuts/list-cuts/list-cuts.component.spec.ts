import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCutsComponent } from './list-cuts.component';

describe('ListCutsComponent', () => {
  let component: ListCutsComponent;
  let fixture: ComponentFixture<ListCutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListCutsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListCutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
