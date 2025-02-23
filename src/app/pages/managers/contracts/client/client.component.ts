import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject, Observable, takeUntil, filter, first, switchMap, EMPTY } from 'rxjs';
import { GenericConfig } from 'src/app/core/config/generic.config';
import { IClient } from 'src/app/models/client';
import { IClientMeter } from 'src/app/models/clientMeter';
import { IContractType } from 'src/app/models/contractType';
import { IOption } from 'src/app/models/option';
import { IZone } from 'src/app/models/zone';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog.service';
import { listAllZones, listAllContractTypes, createClient, createClientMeter} from 'src/app/store';
import { selectSelectedClient, selectClientIsSaving, selectClientErrorMessage, selectClientSuccessMessage, selectClientStatusCode } from 'src/app/store/selectors/client.selectors';
import { selectSelectedClientMeter } from 'src/app/store/selectors/clientMeter.selectors';
import { selectSelectedContractTypes } from 'src/app/store/selectors/contractType.selectors';
import { selectSelectedZones, selectZoneIsLoading } from 'src/app/store/selectors/zone.selectors';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit {
  @Output() clientSaved = new EventEmitter<any>();
  @Output() meterSaved = new EventEmitter<IClientMeter>();
  
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
  selectStatusCode$!: Observable<number | null>; 

  getZonesByEnterpriseId$ = this.store.pipe(select(selectSelectedZones));
  getContactTypes$ = this.store.pipe(select(selectSelectedContractTypes)); 
  getClient$ = this.store.pipe(select(selectSelectedClient)); 
  year: number = 0
  monthsData: IOption[] = [];
  user: string = '';
  defaultBrand: string = 'Agua Mambo';
  selectedZoneId: string = '';
  selectedEnterpriseId: string = '';
  isAccordionOpen = false;

  constructor(
    private fb: FormBuilder, 
    private store: Store, 
    private _dialogService: DialogService,
    private generic: GenericConfig, 
    private auth: AuthService) { }

  ngOnInit(): void {
      this.checkSession();
    this.year = this.generic.getCurrentYear()

    this.clientForm = this.fb.group({
      name: new FormControl(null),
      phoneNumber: new FormControl(null),
      address: new FormControl(null),
      nuit: new FormControl(null),
      zoneId: new FormControl(null),
      alternativeNumber: new FormControl(),
      observation: new FormControl(),
      exemptFromFines: new FormControl(false),
      wantsReceiptSMS: new FormControl(true),
      wantsInvoiceSMS: new FormControl(true)
    });

    this.isZonesLoading$ = this.store.select(selectZoneIsLoading);
    this.isClientSaving$ = this.store.select(selectClientIsSaving);
    this.errorMessage$ = this.store.select(selectClientErrorMessage);
    this.successMessage$ = this.store.select(selectClientSuccessMessage);
    this.selectStatusCode$ = this.store.select(selectClientStatusCode)
    this.loadData()
  }

  loadData() {
    this._dialogService.reset()
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
    this._dialogService.reset();
    const clientData = this.clientForm.value;
    const clientMeter = { brand: this.defaultBrand, cubicMeters: 0 };
  
    if (!this.isValidClientData(clientData)) {
      this.clientSaved.emit();
      return;
    }
  
    this.store.dispatch(createClient({ client: clientData }));
    
    this.store.dispatch(createClientMeter({ clientMeter }));

    this.store.pipe(
      select(selectSelectedClient),
      filter(client => !!client),
      first(),
      switchMap(client => {
        if (!client) return EMPTY;
  
        this._dialogService.open({
          title: 'Criação do Cliente',
          type: 'success',
          message: 'Cliente criado com sucesso',
          isProcessing: false,
          showConfirmButton: false,
        })
  
        this.clientSaved.emit(client);
  
       
        return this.store.pipe(
          select(selectSelectedClientMeter),
          filter(meter => !!meter),
          first()
        );
      })
    ).subscribe({
      next: meter => {
        if (!meter) return;
  
        this._dialogService.open({
          title: 'Sucesso',
          message: 'Contador criado com sucesso!',
          type: 'success',
        });
  
        this.meterSaved.emit(meter);
        this.clientForm.reset();
      },
      error: error => this.showErrorDialog(error)
    });
  }
  
  /**
   * Valida se os dados do cliente estão completos
   */
  private isValidClientData(clientData: any): boolean {
    return ['name', 'phoneNumber', 'address', 'zoneId'].every(field => this.checkIsNotNull(clientData[field]));
  }
  
  /**
   * Exibe um diálogo de erro
   */
  private showErrorDialog(error: any): void {
    this._dialogService.open({
      title: 'Erro',
      message: error?.message || 'Ocorreu um erro inesperado. Por favor, contacte a equipa técnica para suporte.',
      type: 'error',
      showConfirmButton: true,
      cancelText: 'Cancelar',
    });
  }
  

  checkIsNotNull(field: string) : boolean{
    return field !== null
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