import { IZone } from 'src/app/models/zone';
import { combineLatest, filter, first, pipe, take, takeUntil } from 'rxjs';
import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { GenericConfig } from 'src/app/core/config/generic.config';
import { IClient } from 'src/app/models/client';
import { AuthService } from 'src/app/services/auth.service';
import { listAllClients, listAllContracts, listAllContractTypes, listAllZones, updateClient, updateContract } from 'src/app/store';
import { selectClientIsLoading, selectClientIsSaving, selectSelectedClient, selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectSelectedContractType, selectSelectedContractTypes } from 'src/app/store/selectors/contractType.selectors';
import { selectSelectedZone, selectSelectedZones } from 'src/app/store/selectors/zone.selectors';
import { IContractType } from 'src/app/models/contractType';
import { IOption } from 'src/app/models/option';
import { selectSelectedContract, selectSelectedContracts } from 'src/app/store/selectors/contract.selectors';
import { IContract } from 'src/app/models/contract';

@Component({
  selector: 'app-list-customers',
  templateUrl: './list-customers.component.html',
  styleUrl: './list-customers.component.css'
})
export class ListCustomersComponent implements OnInit, OnDestroy {
  generalForm: FormGroup; 
  isEditing: boolean = false;
  selectedClient!: IClient;
  zonesList: IZone[] = [];
  zoneData: IOption[] = [];
  contractTypeData: IOption[] = [];
  contractTypes!: IContractType[];
  contractsList!: IContract[];
  private destroy$ = new Subject<void>();
  clientsList: IClient[] = [];
  clientColumns: { key: keyof IClient; label: string }[] = [];
  isClientSaving$!: Observable<boolean>;
  isClientLoading$!: Observable<boolean>;

  getClients$ = this.store.pipe(select(selectSelectedClients));
  getContractTypes$ = this.store.pipe(select(selectSelectedContractTypes));
  getContracts$ = this.store.pipe(select(selectSelectedContracts));
  getZones$ = this.store.pipe(select(selectSelectedZones));

  constructor(private fb: FormBuilder, private store: Store, private generic: GenericConfig, private auth: AuthService) {
    this.generalForm = this.fb.group({
      clientId: new FormControl(null),
      name: new FormControl(null),
      phoneNumber: new FormControl(null),
      alternativeNumber: new FormControl(null),
      observation: new FormControl(null),
      address: new FormControl(null),
      nuit: new FormControl(null),
      exemptFromFines: new FormControl(false),
      wantsReceiptSMS: new FormControl(false),
      balance: new FormControl(0),
      wantsInvoiceSMS: new FormControl(false),
      contractTypeId: new FormControl(null), 
      contractStatus: new FormControl(0),
      zoneId: new FormControl(null),
      contractId: new FormControl(null)
    });
 
    this.isClientLoading$ = this.store.select(selectClientIsLoading);
    this.isClientSaving$ = this.store.select(selectClientIsSaving);


    this.clientColumns = [
      { key: 'clientId', label: 'Código' },
      { key: 'name', label: 'Nome' },
      { key: 'phoneNumber', label: 'Contacto' },
      { key: 'address', label: 'Endereço' },
      { key: 'nuit', label: 'NUIT' },
      { key: 'balance', label: 'Saldo' },
      { key: 'contractStatus', label: 'Estado do Contracto' },
      { key: 'exemptFromFines', label: 'Isento de Multas' },
      { key: 'contractType', label: 'Tipo de Contacto' },
      { key: 'zone', label: 'Zona' },
    ];

  }
  getCurrentYear(): number {
    return new Date().getFullYear();
  }
 
  ngOnInit(): void {
    this.getData();
  }
  
  getData() {
    this.store.dispatch(listAllClients());
    this.store.dispatch(listAllZones());
    this.store.dispatch(listAllContractTypes());
    this.store.dispatch(listAllContracts());
   
    combineLatest([
      this.getZones$,
      this.getContracts$,
      this.getContractTypes$,
      this.getClients$,
    ])
      .pipe(
        takeUntil(this.destroy$),
        filter(([zones, contracts, contractTypes, clients]) =>
          Boolean(zones && contracts && contractTypes && clients)
        )
      )
      .subscribe(([zones, contracts, contractTypes, clients]) => {
        this.zonesList = zones || [];
        this.contractsList = contracts || [];
        this.contractTypes = contractTypes || [];
        this.clientsList = clients || [];

        if (zones) {   
          this.zoneData = [
            { label: 'Seleccione...', value: '' },
            ...zones.map(zone => ({
              label: zone.designation,
              value: zone.zoneId
            }))
          ];
        }

        if (contractTypes) {
          this.contractTypeData = [
            { label: 'Seleccione...', value: '' },
            ...contractTypes.map(contract => ({
              label: contract.designation,
              value: contract.contractTypeId
            }))
          ];
        }
        this.updateClientsListWithDetails();
      });
  }

  editClient(client: any): void {
    this.isEditing = true;
    this.selectedClient = client;     
    this.generalForm.patchValue(client
     );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
  
  saveClient(): void {
    if (this.generalForm.valid) {
      const formValues = this.generalForm.value;
      const clientPayload = {
        clientId: formValues.clientId,
        name: formValues.name,
        phoneNumber: formValues.phoneNumber,
        alternativeNumber: formValues.alternativeNumber,
        observation: formValues.observation,
        address: formValues.address,
        nuit: formValues.nuit,
        exemptFromFines: formValues.exemptFromFines,
        wantsReceiptSMS: formValues.wantsReceiptSMS,
        wantsInvoiceSMS: formValues.wantsInvoiceSMS,
        zoneId: formValues.zoneId,
      };

      this.store.dispatch(updateClient({clientId: clientPayload.clientId, client: clientPayload}))
   
      const originalContract = this.contractsList.find(contract => contract.contractId === formValues.contractId);
      
      if (originalContract) {

        const contractPayload = {
          contractTypeId: formValues.contractTypeId,
          balance: formValues.balance,
          contractStatus: formValues.contractStatus,
          contractId: formValues.contractId,
        };

        const hasChanges = Object.keys(contractPayload).some(
          key => (contractPayload as Record<string, any>)[key] !== (originalContract as Record<string, any>)[key]
        );

        if (hasChanges) {
          this.store.dispatch(updateContract({contractId: contractPayload.contractId, contract: contractPayload}));
        }  
      }
    } 
  }
 
  cancelEdit(): void {
    this.isEditing = false;  
    this.generalForm.reset(); 
  }


  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  private updateClientsListWithDetails() {
    if (
      this.clientsList &&
      this.zonesList &&
      this.contractTypes &&
      this.contractsList &&
      this.clientsList.length > 0 &&
      this.zonesList.length > 0 &&
      this.contractTypes.length > 0 &&
      this.contractsList.length > 0
    ) { 
      const zoneMap = new Map(this.zonesList.map(z => [z.zoneId, z.designation]));
      const contractTypeMap = new Map(this.contractTypes.map(ct => [ct.contractTypeId, ct.designation]));
      const contractMap = new Map(
        this.contractsList.map(contract => [`${contract.clientId}-${contract.contractTypeId}`, contract])
      );
     
      this.clientsList = this.clientsList.map(client => { 
        const clientContracts = this.contractsList.filter(contract => contract.clientId === client.clientId);
     
        const firstContract = clientContracts.length > 0 ? clientContracts[0] : null;
     
        const contractKey = firstContract
          ? `${firstContract.clientId}-${firstContract.contractTypeId}`
          : null;
     
        const contract = contractKey ? contractMap.get(contractKey) : null;
     
        return {
          ...client,
          contractStatus: contract ? contract.contractStatus : 0,
          balance: contract ? contract.balance : 0,
          contractId: contract ? contract.contractId : '',
          zone: zoneMap.get(client.zoneId) || '',
          contractType: firstContract
            ? contractTypeMap.get(firstContract.contractTypeId) || ''
            : '',
          contractTypeId: firstContract
            ? firstContract.contractTypeId || ''
            : '',
        };
      });
    }
    
  }
  

  onCheckboxValueChange(controlName: string, isChecked: boolean) {
    this.generalForm.get(controlName)?.setValue(isChecked);
  }
   
  onZoneSelect(event: { value: string; label: string }): void {
    this.generalForm.get('zoneId')?.setValue(event.value)
  }
  
  onContractTypeSelect(event: { value: string; label: string }): void {
    this.generalForm.get('contractTypeId')?.setValue(event.value)
  }
}
