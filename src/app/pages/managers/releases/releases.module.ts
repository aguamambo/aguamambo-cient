import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReleasesRoutingModule } from './releases-routing.module';
import { RegisterReadingComponent } from './reading/register-reading/register-reading.component';
import { ListReadingsComponent } from './reading/list-readings/list-readings.component';
import { ListSuspensionsComponent } from './suspension/list-suspensions/list-suspensions.component';
import { RegisterSuspensionComponent } from './suspension/register-suspension/register-suspension.component';
import { RegisterCutComponent } from './cuts/register-cut/register-cut.component';
import { ListCutsComponent } from './cuts/list-cuts/list-cuts.component';
import { ListCustomersComponent } from './customers/list-customers/list-customers.component';
import {RegisterClientComponent } from './customers/register-customer/register-client.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    RegisterReadingComponent,
    ListReadingsComponent,
    ListSuspensionsComponent,
    RegisterSuspensionComponent,
    RegisterCutComponent,
    ListCutsComponent,
    ListCustomersComponent,
    RegisterClientComponent
  ],
  imports: [
    CommonModule, 
    ReleasesRoutingModule,
    FormsModule, 
    HttpClientModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    RegisterReadingComponent,
    ListReadingsComponent,
    ListSuspensionsComponent,
    RegisterSuspensionComponent,
    RegisterCutComponent,
    ListCutsComponent,
    ListCustomersComponent,
    RegisterClientComponent
  ]
})
export class ReleasesModule { }
