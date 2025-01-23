import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';  
import { DashboardComponent } from './dashboard/dashboard.component';
import { BackupComponent } from './backup/backup.component';
import { ReportsComponent } from './reports/reports.component';
import { SetupComponent } from './setup/setup.component';
import { SettingsComponent } from './settings/settings.component';
import { authGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent,canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent,canActivate: [authGuard]  },
  { path: 'setup', component: SetupComponent,canActivate: [authGuard]  },
  { path: 'settings', component: SettingsComponent,canActivate: [authGuard]  },
  { path: 'backups', component: BackupComponent,canActivate: [authGuard]  },
  {path: 'releases', loadChildren: () => import('./releases/releases.module').then(m => m.ReleasesModule)},
  {path: 'contracts', loadChildren: () => import('./contracts/contracts.module').then(m => m.ContractsModule)},
  {path: 'treasuries', loadChildren: () => import('./treasury/treasury.module').then(m => m.TreasuryModule)},
  {path: 'parameterisations', loadChildren: () => import('./parameterisation/parameterisation.module').then(m => m.ParameterisationModule)}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagersRoutingModule {}
