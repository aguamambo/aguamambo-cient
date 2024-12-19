import { filter, first, map } from 'rxjs';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
import { listAllEnterprises, listAllContractTypes, getZoneByEnterpriseId, getClientByZoneId, createContract, listAllClientMeters, listAllAvailableMeters, getZone } from 'src/app/store';
import { selectSelectedClients, selectClientErrorMessage, selectClientSuccessMessage } from 'src/app/store/selectors/client.selectors';
import { selectContractIsSaving, selectSelectedContract } from 'src/app/store/selectors/contract.selectors';
import { selectSelectedContractTypes } from 'src/app/store/selectors/contractType.selectors';
import { selectSelectedEnterprises } from 'src/app/store/selectors/enterprise.selectors';
import { selectSelectedZone, selectSelectedZones } from 'src/app/store/selectors/zone.selectors';
import { selectSelectedAvailableMeters, selectSelectedClientMeter, selectSelectedClientMeters } from 'src/app/store/selectors/clientMeter.selectors';
import { IClientMeter } from 'src/app/models/clientMeter';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrl: './contract.component.css'
})
export class ContractComponent implements OnInit, OnDestroy {
  @Input() meter!: IClientMeter;  
  @Input() client!: IClient;  
  @Input() enterpriseId!: string;  
  @Input() zoneId!: string;     
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
  selectedZone!: IZone; 
  clientsList: IClient[] = []; 
  zoneList: IZone[] = [];
  meterList: IClientMeter[] = [];
  enterprisesList: IEnterprise[] = [];
  getClients$ = this.store.pipe(select(selectSelectedClients));  
  getContractTypes$ = this.store.pipe(select(selectSelectedContractTypes));
  getZonesByEnterpriseId$ = this.store.pipe(select(selectSelectedZones));
  getMeters$ = this.store.pipe(select(selectSelectedAvailableMeters));
  getEnterprises$ = this.store.pipe(select(selectSelectedEnterprises));
  isDialogOpen: boolean = false;
  dialogType: 'success' | 'error' = 'success'; 
  dialogMessage = ''; 
  contractData: any;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private generic: GenericConfig,
    private _dialogService: DialogService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.checkSession();
 
    this.contractForm = this.fb.group({
      startDate: new FormControl(null),
      endDate: new FormControl(null),
      description: new FormControl(null),
      balance: new FormControl(null),
      contractStatus: new FormControl(true),
      clientId: new FormControl(null),
      client: new FormControl(null),
      meterId: new FormControl(null),
      contractTypeId: new FormControl(null)
    });

    this.contractData = {
      meter: this.meter,
      client: this.client,
      enterpriseId: this.enterpriseId,
      zoneId: this.zoneId
    };

    console.log(this.contractData);


    this.isContractSaving$ = this.store.select(selectContractIsSaving);
    this.errorMessage$ = this.store.select(selectClientErrorMessage);
    this.successMessage$ = this.store.select(selectClientSuccessMessage);

    this.loadData();
  }

  loadData() {
    this.store.dispatch(listAllEnterprises());
    this.store.dispatch(listAllContractTypes());
    this.store.dispatch(listAllAvailableMeters());

    // this.store.dispatch(getZone({zoneId: this.client.zoneId}))
    // this.store.pipe(select(selectSelectedZone), filter((zone) => !!zone), first()).subscribe(zone => {
    //   if (zone) {
    //     this.selectedZone = zone
    //   }
    // })

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
 
     
    if (contractData) {

      this._dialogService.open({
        title: 'Processando',
        message: 'Aguarde um instante enquanto guarda ainformações de celebração do contracto.',
        type: 'loading',
        isProcessing: true,
      });
  
      
      this.store.dispatch(createContract({ contract: contractData }));
      this.store.pipe(select(selectSelectedContract), filter((contract) => !!contract), first()) .subscribe({
        next: (contract) => {
          if (contract) {
            this._dialogService.open({
              title: 'Sucesso',
              message: 'Contracto criado com sucesso!',
              type: 'success'
            });
            
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

  openDialog(type: 'success' | 'error', message: string): void {
    this.dialogType = type;
    this.dialogMessage = message;
    this.isDialogOpen = true;
  }

 
  closeDialog(): void {
    this.isDialogOpen = false;
    this.contractForm.reset()
  }
 
}