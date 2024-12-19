import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { select, Store } from "@ngrx/store";
import { filter, first, Subject } from "rxjs";
import { IClientMeter } from "src/app/models/clientMeter";
import { DialogService } from "src/app/services/dialog.service";
import { createClientMeter } from "src/app/store";
import { selectSelectedClientMeter } from "src/app/store/selectors/clientMeter.selectors";

@Component({
  selector: 'app-meter',
  templateUrl: './meter.component.html',
  styleUrl: './meter.component.css'
})
export class MeterComponent implements OnInit {
  @Output() meterSaved = new EventEmitter<IClientMeter>();

  meterForm!: FormGroup;
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _dialogService: DialogService, 
    private store: Store
  ) { }

  ngOnInit(): void {
    this.meterForm = this.fb.group({
      brand: new FormControl(null),
      cubicMeters: new FormControl(null)
    });
  }

  saveMeter(clientId: string): void {
    const meterData = { ...this.meterForm.value, clientId: clientId };
    const validFields = this.checkIsNotNull(meterData.brand) && this.checkIsNotNull(meterData.cubicMeters);

    if (validFields) {
      this.store.dispatch(createClientMeter({ clientMeter: meterData }));
      this.store.pipe((
        select(selectSelectedClientMeter)),
        filter((meter) => !!meter),
        first()
      )
        .subscribe({
          next: (meter) => {
            if (meter) {
              this._dialogService.open({
                title: 'Sucesso',
                message: 'Contador criado com sucesso!',
                type: 'success'
              });
              this.meterSaved.emit(meter)
            }
          },
          error: (error) => {
            this._dialogService.open({
              title: 'Erro',
              message: error.message || 'Ocorreu um erro inesperado. Por favor contacte a equipa tecnica para o suporte.',
              type: 'error',
              showConfirmButton: true,
              cancelText: 'Cancelar',
            });
          }

        })
    }
    this.meterSaved.emit();
  }


  checkIsNotNull(field: string): boolean {
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