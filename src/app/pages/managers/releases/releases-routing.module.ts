import { RegisterCutComponent } from './cuts/register-cut/register-cut.component';
import { ListCustomersComponent } from './customers/list-customers/list-customers.component';
import { ListReadingsComponent } from './reading/list-readings/list-readings.component';
import { RegisterReadingComponent } from './reading/register-reading/register-reading.component';
import { NgModule } from '@angular/core'; 
import { ListCutsComponent } from './cuts/list-cuts/list-cuts.component';
import { Routes, RouterModule } from '@angular/router';
import { ListSuspensionsComponent } from './suspension/list-suspensions/list-suspensions.component';
import { RegisterSuspensionComponent } from './suspension/register-suspension/register-suspension.component';
import { RegisterClientComponent } from './customers/register-customer/register-client.component';

const routes: Routes = [ 
  { path: 'readings/add', component: RegisterReadingComponent },  
  { path: 'readings/list', component: ListReadingsComponent },  
  { path: 'customers/add', component: RegisterClientComponent }, 
  { path: 'customers/list', component: ListCustomersComponent }, 
  { path: 'cuts/add', component: RegisterCutComponent },
  { path: 'cuts/list', component: ListCutsComponent },
  { path: 'suspensions/add', component: RegisterSuspensionComponent }, 
  { path: 'suspensions/list', component: ListSuspensionsComponent }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReleasesRoutingModule {}
