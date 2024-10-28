import { IZone } from 'src/app/models/zone';
import { takeUntil } from 'rxjs';
import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { GenericConfig } from 'src/app/core/config/generic.config';
import { IClient } from 'src/app/models/client';
import { AuthService } from 'src/app/services/auth.service';
import { listAllClients, listAllContractTypes, listAllZones } from 'src/app/store';
import { selectClientIsLoading, selectClientIsSaving, selectSelectedClients } from 'src/app/store/selectors/client.selectors';
import { selectSelectedContractType, selectSelectedContractTypes } from 'src/app/store/selectors/contractType.selectors';
import { selectSelectedZone, selectSelectedZones } from 'src/app/store/selectors/zone.selectors';
import { IContractType } from 'src/app/models/contractType';

@Component({
  selector: 'app-list-customers',
  templateUrl: './list-customers.component.html',
  styleUrl: './list-customers.component.css'
})
export class ListCustomersComponent implements OnInit, OnDestroy {
  clientForm: FormGroup;
  isEditing: boolean = false;
  selectedClient!: IClient;
  zones!: IZone[];
  contractTypes!: IContractType[];
  private destroy$ = new Subject<void>();
  clientsList: IClient[] = []; 
  clientColumns: { key: keyof IClient; label: string }[] = [];
  isClientSaving$!: Observable<boolean>;
  isClientLoading$!: Observable<boolean>;
 
  getClients$ = this.store.pipe(select(selectSelectedClients));
  getContractTypes$ = this.store.pipe(select(selectSelectedContractTypes));
  getZones$ = this.store.pipe(select(selectSelectedZones));

constructor(private fb: FormBuilder, private store: Store, private generic: GenericConfig, private auth: AuthService) { 
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
    this.getData()
  }

  getData() {
    // Dispatch actions to fetch data
    this.store.dispatch(listAllClients());
    this.store.dispatch(listAllZones());
    this.store.dispatch(listAllContractTypes());
   
    this.getZones$.pipe(takeUntil(this.destroy$)).subscribe(zones => {
      if (zones) {
        this.zones = zones;
        this.updateClientsListWithDetails();
      }
    });
   
    this.getContractTypes$.pipe(takeUntil(this.destroy$)).subscribe(contractTypes => {
      if (contractTypes) {
        this.contractTypes = contractTypes;
        this.updateClientsListWithDetails();
      }
    });
   
    this.getClients$.pipe(takeUntil(this.destroy$)).subscribe(clients => {
      if (clients) {
        this.clientsList = clients;
        this.updateClientsListWithDetails();
      }
    });
  }
  
   

  editClient(client: IClient): void {
    this.isEditing = true;
    this.selectedClient = client;
    this.clientForm.patchValue({
       
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onNumberInputChange(inputElement: HTMLInputElement): void {
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
   

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  private updateClientsListWithDetails() {
    if (this.clientsList && this.zones.length > 0 && this.contractTypes.length > 0) {
      this.clientsList = this.clientsList.map(client => {
        const zone = this.zones.find(z => z.zoneId === client.zoneId);
        const contractType = this.contractTypes.find(ct => ct.contractTypeId === client.contractTypeId);
  
        return {
          ...client,
          zone: zone ? zone.designation : '',   
          contractType: contractType ? contractType.designation : ''   
        };
      });
    }
  }
}
