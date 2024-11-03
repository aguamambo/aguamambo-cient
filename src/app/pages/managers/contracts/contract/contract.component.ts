import { map } from 'rxjs';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject, Observable, takeUntil } from 'rxjs';
import { GenericConfig } from 'src/app/core/config/generic.config';
import { IClient } from 'src/app/models/client';
import { IContractType } from 'src/app/models/contractType';
import { IEnterprise } from 'src/app/models/enterprise';
import { IOption } from 'src/app/models/option';
import { IZone } from 'src/app/models/zone';
import { AuthService } from 'src/app/services/auth.service';
import { listAllEnterprises, listAllContractTypes, getZoneByEnterpriseId, getClientByZoneId, createContract, listAllClientMeters } from 'src/app/store';
import { selectSelectedClients, selectClientErrorMessage, selectClientSuccessMessage } from 'src/app/store/selectors/client.selectors';
import { selectContractIsSaving } from 'src/app/store/selectors/contract.selectors';
import { selectSelectedContractTypes } from 'src/app/store/selectors/contractType.selectors';
import { selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { selectSelectedZones } from 'src/app/store/selectors/zone.selectors';
import { selectSelectedClientMeter, selectSelectedClientMeters } from 'src/app/store/selectors/clientMeter.selectors';
import { IClientMeter } from 'src/app/models/clientMeter';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrl: './contract.component.css'
})
export class ContractComponent implements OnInit, OnDestroy {
  @Output() contractSaved = new EventEmitter<any>();

  contractForm!: FormGroup;
  destroy$ = new Subject<void>();
  contractTypeData: IOption[] = [];
  contractTypeList: IContractType[] = [];
  isContractSaving$!: Observable<boolean>;
  errorMessage$!: Observable<string | null>;
  successMessage$!: Observable<string | null>;
  clientData: IOption[] = [];
  enterpriseData: IOption[] = [];
  zoneData: IOption[] = []; 
  meterData: IOption[] = []; 
  clientsList: IClient[] = []; 
  zoneList: IZone[] = [];
  meterList: IClientMeter[] = [];
  enterprisesList: IEnterprise[] = [];
  getClients$ = this.store.pipe(select(selectSelectedClients));  
  getContractTypes$ = this.store.pipe(select(selectSelectedContractTypes));
  getZonesByEnterpriseId$ = this.store.pipe(select(selectSelectedZones));
  getMeters$ = this.store.pipe(select(selectSelectedClientMeters));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private generic: GenericConfig,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.checkSession();

    // Initialize the form with validation rules
    this.contractForm = this.fb.group({
      startDate: new FormControl(null),
      endDate: new FormControl(null),
      description: new FormControl(null),
      balance: new FormControl(null),
      contractStatus: new FormControl(false),
      clientId: new FormControl(null),
      client: new FormControl(null),
      meterId: new FormControl(null),
      contractTypeId: new FormControl(null)
    });

    this.isContractSaving$ = this.store.select(selectContractIsSaving);
    this.errorMessage$ = this.store.select(selectClientErrorMessage);
    this.successMessage$ = this.store.select(selectClientSuccessMessage);

    this.loadData();
  }

  loadData() {
    this.store.dispatch(listAllEnterprises());
    this.store.dispatch(listAllContractTypes());
    this.store.dispatch(listAllClientMeters());

    this.getContractTypes$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
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

    // Adicionando a recuperação dos últimos clientes e contadores
    this.getClients$.pipe(takeUntil(this.destroy$)).subscribe((clients) => {
        if (clients && clients.length > 0) {
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

    this.getMeters$.pipe(takeUntil(this.destroy$)).subscribe(meters => {
      if (meters) {
        this.meterList = meters
        this.meterData = [
          {label: 'Seleccione...', value: ''},
          ...meters.map(meter => ({
            label: meter.meterId,
            value: meter.meterId
          }))
        ]
        this.contractForm.get('meterId')?.setValue(this.meterList[this.meterList.length - 1]?.meterId);
      }
    })

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

  onCheckboxValueChange(controlName: string, isChecked: boolean) {
    if (isChecked) {
      this.contractForm.get(controlName)?.setValue(1);
    }else  this.contractForm.get(controlName)?.setValue(0);
  }

 
  saveContract(): void {
    const contractData = this.contractForm.value;
    
    console.log(contractData);
    
    if (contractData) {
      this.store.dispatch(createContract({ contract: contractData }));
      this.contractSaved.emit();  
    }
  }

  onClientSelect(option: IOption): void {
    this.contractForm.get('client')?.setValue(option.value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkSession() {
    if (!this.auth.authenticated()) {
      this.auth.logout();
    }
  }
}