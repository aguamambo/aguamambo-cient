import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';   
import { DashboardComponent } from '../dashboard/dashboard.component';
import { authGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParameterisationRoutingModule {}
