import { getClientByZoneId } from './../../../../../store/actions/client.actions';
import { getZoneByEnterpriseId } from './../../../../../store/actions/zone.actions';
import { selectReadingErrorMessage, selectReadingIsSaving, selectReadingSuccessMessage, selectSelectedReading } from './../../../../../store/selectors/reading.selectors';
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { select, Store } from "@ngrx/store";
import { Observable, Subject, takeUntil } from "rxjs";
import { IClient } from "src/app/models/client";
import { IEnterprise } from "src/app/models/enterprise";
import { IOption } from "src/app/models/option";
import { IReading } from "src/app/models/reading";
import { IZone } from "src/app/models/zone";
import { AuthService } from 'src/app/services/auth.service';
import { IAppState, createReading, getClientMeter, getLastReadingByClient, listAllEnterprises } from 'src/app/store';
import { selectClientIsLoading, selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectSelectedClientMeter } from 'src/app/store/selectors/clientMeter.selectors';
import { selectEnterpriseIsLoading, selectSelectedEnterprises } from "src/app/store/selectors/enterprise.selectors";
import {  selectSelectedZones, selectZoneIsLoading } from "src/app/store/selectors/zone.selectors";

@Component({
  selector: 'app-register-reading',
  templateUrl: './register-reading.component.html',
  styleUrls: ['./register-reading.component.css']
})
export class RegisterReadingComponent implements OnInit {
  registReadingForm!: FormGroup;
  lastReading: number = 0;
  counter: string | null = '';
  zoneData: IOption[] = [];
  enterpriseData: IOption[] = [];
  clientData: IOption[] = [];
  monthsData: IOption[] = [];
  zoneList: IZone[] = [];
  enterprisesList: IEnterprise[] = [];
  clientsList: IClient[] = [];
  readingsList: IReading[] = [];


  isZonesLoading$: Observable<boolean>;
  isEnterprisesLoading$: Observable<boolean>;
  isClientLoading$: Observable<boolean>;
  isReadingSaving$: Observable<boolean>;
  errorMessage$: Observable<string>;
  successMessage$: Observable<string>;
  
  getZonesByEnterprise$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClientsByZone$ = this.store.pipe(select(selectSelectedClients));
  getReadingsByCustomerId$ = this.store.pipe(select(selectSelectedReading));
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeter));
  private destroy$ = new Subject<void>();
  user: string = '';

  constructor(private store: Store<IAppState>, private auth: AuthService) {
    this.isZonesLoading$ = this.store.select(selectZoneIsLoading);
    this.isEnterprisesLoading$ = this.store.select(selectEnterpriseIsLoading);
    this.isClientLoading$ = this.store.select(selectClientIsLoading);
    this.isReadingSaving$ = this.store.select(selectReadingIsSaving);
    this.errorMessage$ = this.store.select(selectReadingErrorMessage);
    this.successMessage$ = this.store.select(selectReadingSuccessMessage);

  }

  ngOnInit(): void {

    this.checkSession();
    this.initForm();
    this.loadData();
    this.registReadingForm.controls['meterId'].disable();
  }

  initForm(): void {
    this.registReadingForm = new FormGroup({
      currentReading: new FormControl(null),
      readingMonth: new FormControl(null), 
      readingYear: new FormControl(this.getCurrentYear()),
      meterId: new FormControl(null)
    });
  }

  enableFormControls(): void {
    this.registReadingForm.controls['meterId'].enable();;
  }

  loadData(): void {
    this.generateMonths();
    this.store.dispatch(listAllEnterprises());
    this.getEnterprises$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
      if (enterprises) {
        this.enterprisesList = enterprises;
        this.enterpriseData = [
          { label: 'Seleccione...', value: '' },
          ...enterprises.map(enterprise => ({
            label: enterprise.name,
            value: enterprise.enterpriseId
          }))
        ];

      }
    });

  }

  onValueSelected(option: IOption): void {
    if (option && option.value) {
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: option.value }));
      this.getZonesByEnterprise$.pipe(takeUntil(this.destroy$)).subscribe((zones) => {
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
    }
  }

  onEnterpriseSelect(event: { value: string; label: string }): void {
    if (event && event.value) {
      const selectedValue = event.value;
      this.store.dispatch(getClientByZoneId({ zoneId: selectedValue }));
      this.getClientsByZone$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
        if (clients) {
          this.clientsList = clients;
          this.clientData = [
            { label: 'Seleccione...', value: '' },
            ...clients.map(client => ({
              label: client.name,
              value: client.clientId
            }))
          ];
        }
      });
    }
  }

  onCustomerSelect(selectedCustomer: { label: string, value: string }): void {
    this.getClientsByZone$.pipe(takeUntil(this.destroy$)).subscribe((customers) => {
      if (customers) {

        const customerDetails = customers.find(customer => customer.clientId === selectedCustomer.value);
        if (customerDetails) {
          this.store.dispatch(getLastReadingByClient({ clientId: customerDetails.clientId }));
          this.store.dispatch(getClientMeter({ meterId: customerDetails.clientId }))

          this.getReadingsByCustomerId$.pipe(takeUntil(this.destroy$)).subscribe((readings) => {
            if (readings) { 
              this.lastReading = readings.currentReading;
              this.enableFormControls();
            }
          });

          this.getMeterByClientId$.pipe(takeUntil(this.destroy$)).subscribe((counter) => {
            if (counter)
              this.counter = counter.meterId
              this.registReadingForm.patchValue({
                meterId: this.counter
              })
          })
        }
      }
    });
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }

  saveReading(): void {
    if (this.registReadingForm.valid) { 
      this.registReadingForm.get('meterId')?.setValue(this.counter)

      const formData = this.registReadingForm.value;

      this.store.dispatch(createReading({reading: formData}))

    } else {
      
    }
  }
  onMonthSelect(selectedOption: { value: string; label: string }) {
    this.registReadingForm.get('readingMonth')?.setValue(selectedOption.value)
  }
   

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateMonths(): void {
    this.monthsData = [
      { value: '1', label: 'Janeiro' },
      { value: '2', label: 'Fevereiro' },
      { value: '3', label: 'Março' },
      { value: '4', label: 'Abril' },
      { value: '5', label: 'Maio' },
      { value: '6', label: 'Junho' },
      { value: '7', label: 'Julho' },
      { value: '8', label: 'Agosto' },
      { value: '9', label: 'Setembro' },
      { value: '10', label: 'Outubro' },
      { value: '11', label: 'Novembro' },
      { value: '12', label: 'Dezembro' }
    ];
  }

  checkSession() {
    if (!this.auth.authenticated()) {
      this.auth.logout()
    } else {
      this.user = this.auth.decryptData(localStorage.getItem('name') || '')
    }
  }
}