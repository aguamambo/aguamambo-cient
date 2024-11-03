import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { Store } from "@ngrx/store";
import { Subject } from "rxjs";
import { createClientMeter } from "src/app/store";

@Component({
  selector: 'app-meter',
  templateUrl: './meter.component.html',
  styleUrl: './meter.component.css'
})
export class MeterComponent implements OnInit {
  @Output() meterSaved = new EventEmitter<any>();
 
  meterForm!: FormGroup;
  destroy$ = new Subject<void>();  
  
  constructor(private fb: FormBuilder, private store: Store) { }

  ngOnInit(): void {  
    this.meterForm = this.fb.group({
      brand:  new FormControl(null),
      cubicMeters: new FormControl(null) 
    });      
  } 

 
saveMeter(clientId: string): void {
  const meterData = { ...this.meterForm.value, clientId: clientId };

  const validFields = this.checkIsNotNull(meterData.brand) && this.checkIsNotNull(meterData.cubicMeters);
  if (validFields) {
    this.store.dispatch(createClientMeter({ clientMeter: meterData }));
  }
  this.meterSaved.emit();
}


  checkIsNotNull(field: string) : boolean{
    return field !== null
  }


  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}