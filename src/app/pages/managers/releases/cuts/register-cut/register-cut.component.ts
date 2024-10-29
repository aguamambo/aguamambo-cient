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
import { IAppState, createCut, getClientByZoneId, getZoneByEnterpriseId, listAllClients, listAllEnterprises } from "src/app/store";
import { selectClientIsLoading, selectSelectedClients } from "src/app/store/selectors/client.selectors";
import { selectSelectedClientMeter, selectSelectedClientMeters } from "src/app/store/selectors/clientMeter.selectors";
import { selectCutIsSaving } from "src/app/store/selectors/cut.selectors";
import { selectSelectedEnterprises } from "src/app/store/selectors/enterprise.selectors";
import { selectSelectedZones } from "src/app/store/selectors/zone.selectors";

@Component({
  selector: 'app-register-cut',
  templateUrl: './register-cut.component.html',
  styleUrl: './register-cut.component.css'
})
export class RegisterCutComponent  implements OnInit {

  registCutForm!: FormGroup;   
  clientData: IOption[] = [];
  clientMetersData: IOption[] = [];
  enterpriseData: IOption[] = [];
  monthsData: IOption[] = []; 
  zoneData: IOption[] = []; 
  clientsList: IClient[] = []; 
  zoneList: IZone[] = [];
  enterprisesList: IEnterprise[] = [];
 
  isClientsLoading$: Observable<boolean>;
  isCutSaving$: Observable<boolean>;

  getZonesByEnterpriseId$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClients$ = this.store.pipe(select(selectSelectedClients));  
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeters));
  private destroy$ = new Subject<void>();
  user: string = '';
  year: number = 0;
  meter: string | null = '';

  constructor(private store: Store<IAppState>, private auth: AuthService, private generic: GenericConfig) { 
    this.isClientsLoading$ = this.store.select(selectClientIsLoading);
    this.isCutSaving$ = this.store.select(selectCutIsSaving);
    this.year = this.generic.getCurrentYear()
  }

  ngOnInit(): void {
    this.user = this.auth.checkSession();
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    
    this.registCutForm = new FormGroup({  
        startDate: new FormControl(null),
        endDate: new FormControl(null), 
        meterId: new FormControl(null)
    });

  }

  loadData(): void {
   this.monthsData =  this.generic.generateMonths();
   this.store.dispatch(listAllEnterprises());
    this.getEnterprises$.pipe(takeUntil(this.destroy$)).subscribe((enterprises) => {
      if (enterprises) {
        this.enterprisesList = enterprises;
        this.enterpriseData = [
          { label: 'Seleccione...', value: '' },
          ...enterprises.map(Enterprise => ({
            label: Enterprise.name,
            value: Enterprise.enterpriseId
          }))
        ];

      }
    });
  }

  onValueSelected(option: IOption): void {
    if (option && option.value) {
      this.store.dispatch(getZoneByEnterpriseId({ enterpriseId: option.value }));
      this.getZonesByEnterpriseId$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response) {
          this.zoneList = response;
          this.zoneData = [
            { label: 'Seleccione...', value: '' },
            ...response.map(zone => ({
              label: zone.designation,
              value: zone.zoneId
            }))
          ];
        }
      });
    }
  }

  onEnterpriseSelect(option: IOption): void {
    if (option && option.value) {
      const selectedValue = option.value;
      this.store.dispatch(getClientByZoneId({ zoneId: selectedValue }));
      this.getClients$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
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

  onMeterSeclected(option: IOption) {
    if (option && option.value) {
      this.registCutForm.get('meterId')?.setValue(option.value)
    }
  }

   onClientSelect(selectedClient: { label: string, value: string }): void {
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

  getClients(){
    this.store.dispatch(listAllClients());
    this.getClients$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
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


  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }

  saveCut(): void {
    if (this.registCutForm.valid) {
      const formData = this.registCutForm.value;
      this.store.dispatch(createCut({cut: formData}))
    } else {
      
    }
  }

  onStartMonthSelect(selectedOption: { value: string; label: string }) {
    this.registCutForm.get('mesInicio')?.setValue(selectedOption.value)
  }
  onEndMonthSelect(selectedOption: { value: string; label: string }) {
    this.registCutForm.get('mesTermino')?.setValue(selectedOption.value)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
