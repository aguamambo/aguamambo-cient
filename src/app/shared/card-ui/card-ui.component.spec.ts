import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardUiComponent } from './card-ui.component';

describe('CardUiComponent', () => {
  let component: CardUiComponent;
  let fixture: ComponentFixture<CardUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardUiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
