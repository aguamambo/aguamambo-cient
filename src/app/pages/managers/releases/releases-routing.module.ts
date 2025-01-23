import { RegisterCutComponent } from './cuts/register-cut/register-cut.component';
import { ListCustomersComponent } from './customers/list-customers/list-customers.component';
import { ListReadingsComponent } from './reading/list-readings/list-readings.component';
import { RegisterReadingComponent } from './reading/register-reading/register-reading.component';
import { NgModule } from '@angular/core'; 
import { ListCutsComponent } from './cuts/list-cuts/list-cuts.component';
import { Routes, RouterModule } from '@angular/router';
import { ListSuspensionsComponent } from './suspension/list-suspensions/list-suspensions.component';
import { RegisterSuspensionComponent } from './suspension/register-suspension/register-suspension.component';
import { PendingReadingsComponent } from './reading/pending-readings/pending-readings.component';
import { authGuard } from 'src/app/core/guards/auth.guard';
 
const routes: Routes = [ 
  { path: 'readings/add', component: RegisterReadingComponent ,canActivate: [authGuard] },  
  { path: 'readings/list', component: ListReadingsComponent,canActivate: [authGuard]  },   
  { path: 'readings/pending', component: PendingReadingsComponent,canActivate: [authGuard]  },   
  { path: 'customers/list', component: ListCustomersComponent,canActivate: [authGuard]  }, 
  { path: 'cuts/add', component: RegisterCutComponent,canActivate: [authGuard]  },
  { path: 'cuts/list', component: ListCutsComponent,canActivate: [authGuard]  },
  { path: 'suspensions/add', component: RegisterSuspensionComponent,canActivate: [authGuard]  }, 
  { path: 'suspensions/list', component: ListSuspensionsComponent,canActivate: [authGuard]  }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReleasesRoutingModule {}
