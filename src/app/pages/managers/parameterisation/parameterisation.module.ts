import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParameterisationRoutingModule } from './parameterisation-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';



@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    ParameterisationRoutingModule
  ]
})
export class ParameterisationModule { }
