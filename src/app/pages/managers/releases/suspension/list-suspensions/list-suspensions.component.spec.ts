import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSuspensionsComponent } from './list-suspensions.component';

describe('ListSuspensionsComponent', () => {
  let component: ListSuspensionsComponent;
  let fixture: ComponentFixture<ListSuspensionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListSuspensionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListSuspensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
