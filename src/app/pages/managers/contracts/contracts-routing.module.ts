import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListContractsComponent } from "./list-contracts/list-contracts.component";
import { CreateContractComponent } from "./create-contract/create-contract.component";

const routes: Routes = [
  { path: 'contracts/list-contracts', component: ListContractsComponent },
  { path: 'contracts/create-contract', component: CreateContractComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ContractsRoutingModule { }
