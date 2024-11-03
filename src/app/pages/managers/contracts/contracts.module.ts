import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractsRoutingModule } from './contracts-routing.module';
import { ListContractsComponent } from './list-contracts/list-contracts.component';
import { CreateContractComponent } from './create-contract/create-contract.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ContractComponent } from './contract/contract.component';
import { ClientComponent } from './client/client.component';
import { MeterComponent } from './meter/meter.component';


@NgModule({
  declarations: [
    ListContractsComponent,
    CreateContractComponent,
    ContractComponent,
    ClientComponent,
    MeterComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    ContractsRoutingModule
  ],
  exports: [
    ListContractsComponent,
    CreateContractComponent,
    ContractComponent
  ]
})
export class ContractsModule { }
