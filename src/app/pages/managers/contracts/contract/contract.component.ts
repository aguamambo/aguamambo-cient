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
import { selectContractErrorMessage, selectContractIsSaving, selectSelectedContract } from 'src/app/store/selectors/contract.selectors';
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
  getClients$ = this._store.pipe(select(selectSelectedClients));
  getContractTypes$ = this._store.pipe(select(selectSelectedContractTypes));
  getZonesByEnterpriseId$ = this._store.pipe(select(selectSelectedZones));
  getMeters$ = this._store.pipe(select(selectSelectedAvailableMeters));
  getEnterprises$ = this._store.pipe(select(selectSelectedEnterprises));
  isDialogOpen: boolean = false;
  dialogType: 'success' | 'error' = 'success';
  dialogMessage = '';
  contractData: any;

  constructor(
    private _fb: FormBuilder,
    private _store: Store,
    private _dialogService: DialogService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.checkSession();

    this.contractForm = this._fb.group({
      startDate: new FormControl(null, [Validators.required]), 
      description: new FormControl(''),
      balance: new FormControl(0),
      contractStatus: new FormControl(1),
      clientId: new FormControl(null, [Validators.required]),
      client: new FormControl(null, [Validators.required]),
      meterId: new FormControl(null, [Validators.required]),
      contractTypeId: new FormControl(null, [Validators.required])
    });

    this.contractData = {
      meter: this.meter,
      client: this.client,
      enterpriseId: this.enterpriseId,
      zoneId: this.zoneId
    };

    this.isContractSaving$ = this._store.select(selectContractIsSaving);
    this.errorMessage$ = this._store.select(selectClientErrorMessage);
    this.successMessage$ = this._store.select(selectClientSuccessMessage);

    this.loadData();
  }

  loadData() {
    this._store.dispatch(listAllEnterprises());
    this._store.dispatch(listAllContractTypes());
    this._store.dispatch(listAllAvailableMeters());

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
      this._store.dispatch(getZoneByEnterpriseId({ enterpriseId: option.value }));
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
      this._store.dispatch(getClientByZoneId({ zoneId: selectedValue }));
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
    } else this.contractForm.get(controlName)?.setValue(0);
  }

  saveContract(): void {

    if (this.contractForm.valid) {

      const contractData = this.contractForm.value;

      this._store.dispatch(createContract({ contract: contractData }));

      this._store.pipe(select(selectContractErrorMessage)).subscribe(
        error => {
          if (error) {
            
            
            this._dialogService.open({
              title: 'Criação do Contracto',
              type: 'error',
              message: 'Um erro ocorreu ao criar o Contracto! verifique se os dados estão devidadmente preenchidos e volte a submeter.',
              isProcessing: false,
              showConfirmButton: false,
            })
          } else {
            this._store.pipe(select(selectSelectedContract), filter((fineConfiguration) => !!fineConfiguration))
              .subscribe((fineConfiguration) => {
                if (fineConfiguration) {
                  this._dialogService.open({
                    title: 'Criação do Contracto',
                    type: 'success',
                    message: 'Contracto criado com sucesso!',
                    isProcessing: false,
                    showConfirmButton: false,
                  })
                  this.eraseForm()
                }
              });
          }

        })
      this.contractSaved.emit();
    } else {
      this._dialogService.open({
        title: 'Validação de Dados',
        type: 'info',
        message: 'Por favor verifique se os campos estão devidadmente preenchidos e volte a submeter.',
        isProcessing: false,
        showConfirmButton: false,
      })
    }
  }

  eraseForm() {
    this.contractForm.reset();
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