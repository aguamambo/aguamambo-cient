import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListContractsComponent } from "./list-contracts/list-contracts.component";
import { CreateContractComponent } from "./create-contract/create-contract.component";
import { authGuard } from "src/app/core/guards/auth.guard";

const routes: Routes = [
  { path: 'contracts/list-contracts', component: ListContractsComponent, canActivate: [authGuard]  },
  { path: 'contracts/create-contract', component: CreateContractComponent, canActivate: [authGuard]  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ContractsRoutingModule { }
