import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { select, Store } from "@ngrx/store";
import { Observable, Subject, takeUntil } from "rxjs";
import { GenericConfig } from "src/app/core/config/generic.config";
import { IClient } from "src/app/models/client";
import { IEnterprise } from "src/app/models/enterprise";
import { IOption } from "src/app/models/option";
import { IZone } from "src/app/models/zone";
import { AuthService } from "src/app/services/auth.service";
import { IAppState, createSuspension, getClientByZoneId, getClientMeter, getClientMeterByClientId, getZoneByEnterpriseId, listAllClients, listAllEnterprises } from "src/app/store";
import { selectClientIsLoading, selectSelectedClients } from "src/app/store/selectors/client.selectors";
import { selectSelectedClientMeter, selectSelectedClientMeters } from 'src/app/store/selectors/clientMeter.selectors';
import { selectSelectedEnterprises } from "src/app/store/selectors/enterprise.selectors";
import { selectSuspensionIsSaving } from "src/app/store/selectors/suspension.selectors";
import { selectSelectedZones } from "src/app/store/selectors/zone.selectors";

@Component({
  selector: 'app-register-suspension',
  templateUrl: './register-suspension.component.html',
  styleUrl: './register-suspension.component.css'
})
export class RegisterSuspensionComponent  implements OnInit {
  registSuspensionForm!: FormGroup;   
  clientsData: IOption[] = [];
  clientMetersData: IOption[] = [];
  enterpriseData: IOption[] = [];
  monthsData: IOption[] = []; 
  ZoneData: IOption[] = []; 
  clientsList: IClient[] = []; 
  ZoneList: IZone[] = [];
  enterprisesList: IEnterprise[] = [];
  clientMeter!: string | null
 
  isCustomersLoading$: Observable<boolean>;
  isSuspensionSaving$: Observable<boolean>;

  getZonesByCompanyId$ = this.store.pipe(select(selectSelectedZones));
  getEnterprise$ = this.store.pipe(select(selectSelectedEnterprises));
  getClients$ = this.store.pipe(select(selectSelectedClients));
  getMeterByClientId$  = this.store.pipe(select(selectSelectedClientMeters));
  private destroy$ = new Subject<void>();
  user: string = '';
  year: number = 0;

  constructor(private store: Store<IAppState>, private auth: AuthService, private generic: GenericConfig) { 
    this.isCustomersLoading$ = this.store.select(selectClientIsLoading);
    this.isSuspensionSaving$ = this.store.select(selectSuspensionIsSaving);
    this.year = this.generic.getCurrentYear()

  }

  ngOnInit(): void {
    this.user = this.auth.checkSession();
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    
    this.registSuspensionForm = new FormGroup({  
        meterId: new FormControl(null),
        startDate: new FormControl(null),
        endDate: new FormControl(null),
    });

  }

  loadData(): void {
   this.monthsData =  this.generic.generateMonths();
   this.store.dispatch(listAllEnterprises());
    this.getEnterprise$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
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

  onValueSelected(event: { value: string; label: string }): void {
    if (event && event.value) {
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: event.value }));
      this.getZonesByCompanyId$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response) {
          this.ZoneList = response;
          this.ZoneData = [
            { label: 'Seleccione...', value: '' },
            ...response.map(area => ({
              label: area.designation,
              value: area.zoneId
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
      this.getClients$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
        if (clients) {
          this.clientsList = clients;
          this.clientsData = [
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

  
onClientSelect(event: { value: string; label: string }): void {
  const clientId = event.value; 

  if (clientId) { 
    this.store.dispatch(getClientMeterByClientId({ clientId: clientId }));
 
    this.getMeterByClientId$.pipe(takeUntil(this.destroy$)).subscribe((meters) => {
      if (meters) {
        this.clientMetersData = [
          { label: 'Seleccione...', value: '' },
          ...meters.map(meter => ({
            label: meter.meterId || '',
            value: meter.meterId || ''
          }))
        ];
        
      }
    })
  }  
}

onMeterSeclected(option: IOption) {
  if (option && option.value) {
    this.registSuspensionForm.get('meterId')?.setValue(option.value)
  }
}

 

  getClients(){
    this.store.dispatch(listAllClients());
    this.getClients$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
      if (clients) {
        this.clientsList = clients; 
        this.clientsData = [
          { label: 'Seleccione...', value: '' },
          ...clients.map(client => ({
            label: client.name,
            value: client.clientId
          }))
        ]; 
      }
    });
  }


  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }

  saveSuspension(): void {
    if (this.registSuspensionForm.valid) {
      const formData = this.registSuspensionForm.value;
      this.store.dispatch(createSuspension({suspension: formData}))
    } else {
      
    }
  }

  onStartMonthSelect(selectedOption: { value: string; label: string }) {
    this.registSuspensionForm.get('startDate')?.setValue(selectedOption.value)
  }
  onEndMonthSelect(selectedOption: { value: string; label: string }) {
    this.registSuspensionForm.get('endDate')?.setValue(selectedOption.value)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
