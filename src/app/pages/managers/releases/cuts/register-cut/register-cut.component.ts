import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { select, Store } from "@ngrx/store";
import { filter, first, Observable, Subject, takeUntil } from "rxjs";
import { GenericConfig } from "src/app/core/config/generic.config";
import { IClient } from "src/app/models/client";
import { IEnterprise } from "src/app/models/enterprise";
import { IOption } from "src/app/models/option";
import { IZone } from "src/app/models/zone";
import { AuthService } from "src/app/services/auth.service";
import { DialogService } from "src/app/services/dialog.service";
import { IAppState, createCut, getClientByZoneId, getClientMeterByClient, getZoneByEnterpriseId, listAllClients, listAllEnterprises } from "src/app/store";
import { selectClientIsLoading, selectSelectedClients } from "src/app/store/selectors/client.selectors";
import { selectClientMeterIsLoading, selectSelectedClientMeter, selectSelectedClientMeters } from "src/app/store/selectors/clientMeter.selectors";
import { selectCutIsSaving, selectSelectedCut } from "src/app/store/selectors/cut.selectors";
import { selectEnterpriseIsLoading, selectSelectedEnterprises } from "src/app/store/selectors/enterprise.selectors";
import { selectSelectedZones, selectZoneIsLoading } from "src/app/store/selectors/zone.selectors";

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
  isZonesLoading$: Observable<boolean>;
  isEnterprisesLoading$: Observable<boolean>;
  isClientLoading$: Observable<boolean>;
  isMeterLoading$: Observable<boolean>;
  
  getZonesByEnterpriseId$ = this.store.pipe(select(selectSelectedZones));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  getClients$ = this.store.pipe(select(selectSelectedClients));  
  getMeterByClientId$ = this.store.pipe(select(selectSelectedClientMeters));
  private destroy$ = new Subject<void>();
  user: string = '';
  clientId: string = '';
  year: number = 0;
  counter: string = '';
  meter: string | null = '';

  constructor(
    private store: Store<IAppState>, 
    private auth: AuthService, 
    private _dialogService: DialogService,
    private generic: GenericConfig) { 
    this.isClientsLoading$ = this.store.select(selectClientIsLoading);
    this.isCutSaving$ = this.store.select(selectCutIsSaving);
    this.isZonesLoading$ = this.store.select(selectZoneIsLoading);
    this.isEnterprisesLoading$ = this.store.select(selectEnterpriseIsLoading);
    this.isClientLoading$ = this.store.select(selectClientIsLoading);
    this.isMeterLoading$ = this.store.select(selectClientMeterIsLoading);
    
    this.year = this.generic.getCurrentYear()
  }

  ngOnInit(): void { 
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    
    this.registCutForm = new FormGroup({  
        startDate: new FormControl(null), 
        meterId: new FormControl(null)
    });

  }

  loadData(): void {
    this._dialogService.reset()
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
    const clientDetails = this.clientsList.find(client => client.clientId === selectedClient.value);
    if (clientDetails) {
      this.counter = ''
      this.clientId = clientDetails.clientId;
      this.store.dispatch(getClientMeterByClient({ clientId: this.clientId }));
  
      this.getMeterByClientId$.pipe(takeUntil(this.destroy$)).subscribe(
        (meters) => {
          if (meters) {
            this.clientMetersData = [ 
              ...meters.map(meter => ({ label: meter.meterId || '', value: meter.meterId || '' }))
            ];
            this.counter = meters[0].meterId
             
          }
        }
        
      );
    }
  }
  isFormValid(): boolean {
    const result =  Object.values(this.registCutForm.value).every(value => value !== null && value !== undefined);
    
    return result
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
    this._dialogService.reset()
    if (this.registCutForm.valid) {

      this._dialogService.open({
        title: 'Processando',
        message: 'Aguarde um instante enquanto guarda ainformações do corte.',
        type: 'loading',
        isProcessing: true,
      });

      const formData = this.registCutForm.value;
      this.store.dispatch(createCut({cut: formData}))
      this.store.pipe(select(selectSelectedCut), filter((cut) => !!cut), first())
      .subscribe({
        next: (cut) => {
          if (cut) { 
            this._dialogService.open({
              title: 'Sucesso',
              message: 'Corte criado com sucesso!',
              type: 'success',
              showConfirmButton: true, 
            });
           
          }},
          error: (error) => {
            this._dialogService.open({
              title: 'Erro',
              message: error.message || 'Ocorreu um erro inesperado. Por favor contacte a equipa tecnica para o suporte.',
              type: 'error',
              showConfirmButton: true, 
              cancelText: 'Cancelar',
            });
          },})
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
    this._dialogService.reset()
  }

}
