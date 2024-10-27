import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GenericConfig } from 'src/app/core/config/generic.config';
import { IContractType } from 'src/app/models/contractType';
import { IOption } from 'src/app/models/option';
import { IZone } from 'src/app/models/zone';
import { AuthService } from 'src/app/services/auth.service';
import { createClient, listAllContractTypes, listAllZones } from 'src/app/store';
import { selectClientErrorMessage, selectClientIsSaving, selectClientSuccessMessage } from 'src/app/store/selectors/client.selectors';
import { selectSelectedContractTypes } from 'src/app/store/selectors/contractType.selectors';
import { selectSelectedZones, selectZoneIsLoading } from 'src/app/store/selectors/zone.selectors';

@Component({
  selector: 'app-register-client',
  templateUrl: './register-client.component.html',
  styleUrl: './register-client.component.css'
})
export class RegisterClientComponent implements OnInit {
  clientForm!: FormGroup;
  destroy$ = new Subject<void>();
  zoneData: IOption[] = [];
  contractTypeData: IOption[] = [];
  contractTypeList: IContractType[] = [];
  zoneList: IZone[] = [];
  isClientSaving$!: Observable<boolean>;
  isZonesLoading$!: Observable<boolean>;
  errorMessage$!: Observable<string | null>;
  successMessage$!: Observable<string | null>;

  getZonesByEnterpriseId$ = this.store.pipe(select(selectSelectedZones));
  getContactTypes$ = this.store.pipe(select(selectSelectedContractTypes));
  year: number = 0
  monthsData: IOption[] = [];
  user: string = '';
  isAccordionOpen = false;
  constructor(private fb: FormBuilder, private store: Store, private generic: GenericConfig, private auth: AuthService) { }

  ngOnInit(): void {
    // this.user = this.auth.checkSession();
    this.year = this.generic.getCurrentYear()

    this.clientForm = this.fb.group({
      endereco: new FormControl(),
      nome: new FormControl(),
      nuit: new FormControl(),
      telefone: new FormControl(),
      telefone2: new FormControl(),
      tipoContratoId: new FormControl(),
      utilizadorCriacao: new FormControl(this.user),
      mesInicial: new FormControl(),
      anoEconomicoInicial: new FormControl(this.year),
      zonaId: new FormControl(),
      observacao: new FormControl(),
      isentoDeMultas: new FormControl(false),
      receberRecibo: new FormControl(false),
      receberFactura: new FormControl(false),
    });

    this.isZonesLoading$ = this.store.select(selectZoneIsLoading);
    this.isClientSaving$ = this.store.select(selectClientIsSaving);
    this.errorMessage$ = this.store.select(selectClientErrorMessage);
    this.successMessage$ = this.store.select(selectClientSuccessMessage);
    this.loadData()
  }

  loadData() {
    this.monthsData = this.generic.generateMonths()

    this.store.dispatch(listAllZones());
    this.getZonesByEnterpriseId$.pipe(takeUntil(this.destroy$)).subscribe((zones) => {
      if (zones) {
        this.zoneList = zones;
        this.zoneData = [
          { label: 'Seleccione...', value: '' },
          ...zones.map(zone => ({
            label: zone.designation,
            value: zone.zoneId
          }))
        ];
      }
    });

    this.store.dispatch(listAllContractTypes());
    this.getContactTypes$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response) {
        this.contractTypeList = response;
        this.contractTypeData = [
          { label: 'Seleccione...', value: '' },
          ...response.map(contract => ({
            label: contract.designation,
            value: contract.contractTypeId
          }))
        ];
      }
    });
  }

  onEnterpriseSelect(event: { value: string; label: string }): void {
  }

  onMonthSelect(selectedOption: { value: string; label: string }) {
    this.clientForm.get('mesInicial')?.setValue(selectedOption.value)
  }
  saveClient(): void {
    if (this.clientForm.valid) {
      const payload = this.clientForm.value;

      this.store.dispatch(createClient({ client: payload }));
    }
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  } 

  onCheckboxValueChange(controlName: string, isChecked: boolean) {
    this.clientForm.get(controlName)?.setValue(isChecked);
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}