import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { delay, first, Observable, Subject, takeUntil } from 'rxjs';
import { GenericConfig } from 'src/app/core/config/generic.config';
import { IClientMeter } from 'src/app/models/clientMeter';
import { IContractType } from 'src/app/models/contractType';
import { IOption } from 'src/app/models/option';
import { IZone } from 'src/app/models/zone';
import { AuthService } from 'src/app/services/auth.service';
import { createClient, createClientMeter, listAllContractTypes, listAllZones } from 'src/app/store';
import { selectClientErrorMessage, selectClientIsSaving, selectClientSuccessMessage, selectSelectedClient } from 'src/app/store/selectors/client.selectors';
import { selectSelectedContractTypes } from 'src/app/store/selectors/contractType.selectors';
import { selectSelectedZones, selectZoneIsLoading } from 'src/app/store/selectors/zone.selectors';

@Component({
  selector: 'app-register-client',
  templateUrl: './register-client.component.html',
  styleUrl: './register-client.component.css'
})
export class RegisterClientComponent implements OnInit {
  clientForm!: FormGroup;
  meterForm!: FormGroup;
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
  getClient$ = this.store.pipe(select(selectSelectedClient));
  year: number = 0
  monthsData: IOption[] = [];
  user: string = '';
  isAccordionOpen = false;
  

  constructor(private fb: FormBuilder, private store: Store, private generic: GenericConfig, private auth: AuthService) { }

  ngOnInit(): void {
      this.checkSession();
    this.year = this.generic.getCurrentYear()

     
      
    

    this.clientForm = this.fb.group({
      name: new FormControl(null),
      phoneNumber: new FormControl(null),
      address: new FormControl(null),
      nuit: new FormControl(null),
      zoneId: new FormControl(null),
      contractTypeId: new FormControl(null),
      alternativePhoneNumber: new FormControl(),
      startMonth: new FormControl(),
      notes: new FormControl(),
      exemptFromFines: new FormControl(false),
      receiveReceipt: new FormControl(false),
      receiveInvoice: new FormControl(false),
      brand:  new FormControl(''),
      cubicMeters: new FormControl('') 
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
    this.clientForm.get('startMonth')?.setValue(selectedOption.value)
  }
  saveClient(): void {
    if (this.clientForm.valid) {

      const clientData = this.payload_Client;
      const meterData = this.payload_Meter; 
 
      this.store.dispatch(createClient({ client: clientData }));


      delay(5000)

      this.getClient$.pipe(
        first(client => !!client)   
      ).subscribe(client => {
        if (client) {
          const payload: IClientMeter = {
            meterId: '',
            ...meterData,
            clientId: client.clientId
          };
          
          console.log(payload);
          
          this.store.dispatch(createClientMeter({clientMeter: payload}))
        }
      })
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

  get payload_Client() {
    const { brand, cubicMeters, ...clientData } = this.clientForm.value;
    return clientData;
  }

  get payload_Meter() {
    const { brand, cubicMeters } = this.clientForm.value;
    return { brand, cubicMeters };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkSession() {
    if (!this.auth.authenticated()){
      this.auth.logout()
    }
  }
}