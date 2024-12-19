import { selectSelectedContracts } from './../../../../store/selectors/contract.selectors';
import { Component, ViewChild } from '@angular/core';
import { ClientComponent } from '../client/client.component';
import { ContractComponent } from '../contract/contract.component';
import { MeterComponent } from '../meter/meter.component';
import { IContract } from 'src/app/models/contract';
import { select, Store } from '@ngrx/store';
import { IAppState, listAllContracts } from 'src/app/store';
import { selectContractIsLoading } from 'src/app/store/selectors/contract.selectors';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-contracts',
  templateUrl: './list-contracts.component.html',
  styleUrl: './list-contracts.component.css'
})
export class ListContractsComponent {
  contractsList: IContract[] = [];
  contractsData: IContract[] = [];
  filteredContracts: IContract[] = [];  
  contractColumns: { key: keyof IContract; label: string }[] = [];
  isContractsLoading$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(private store: Store<IAppState>) {

    this.isContractsLoading$ = this.store.select(selectContractIsLoading);

    this.contractColumns = [
      { key: 'contractId', label: 'Id Contrato' },
      { key: 'startDate', label: 'Data Inicio' },
      { key: 'endDate', label: 'Data Fim' },
      { key: 'clientId', label: 'Id do Cliente' },
      { key: 'meterId', label: 'Contador' },
      { key: 'contractTypeId', label: 'Tipo de Contrato' },
      { key: 'description', label: 'Descrição' },
      { key: 'contractStatus', label: 'Estado do Contrato' },
      { key: 'balance', label: 'Saldo' },
    ];
  }

  ngOnInit(): void {  
    this.loadData();
  }

  loadData(): void {
    this.store.dispatch(listAllContracts());
    this.store.pipe(select(selectSelectedContracts), takeUntil(this.destroy$)).subscribe(contracts => {
      if (contracts) {
        this.contractsList = contracts;
        this.contractsData = contracts.map(contract => ({
          ...contract,
          startDate: this.formatDate(contract.startDate),
          endDate: this.formatDate(contract.endDate)
        }));
        this.filteredContracts = [...this.contractsData];
      }
    });
  }

  getContract(contract: IContract): void {

  }

  filterContracts(searchTerm: string): void {
    const searchTermLower = searchTerm.toLowerCase();
    this.filteredContracts = this.contractsData.filter(contract =>
      Object.values(contract).some(value =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }
}
