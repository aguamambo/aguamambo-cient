import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { ManagerLayoutComponent } from './layouts/manager-layout/manager-layout.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },  
  {
    path: 'auth',
    component: AuthLayoutComponent,  
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  
  {
    path: 'manager',
    component: ManagerLayoutComponent,  
    loadChildren: () => import('./pages/managers/managers.module').then(m => m.ManagersModule)
  },
{
    path: 'technical',
    component: ManagerLayoutComponent,  
    loadChildren: () => import('./pages/managers/managers.module').then(m => m.ManagersModule)
  },

  {path:'**', redirectTo: 'auth/login'}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
