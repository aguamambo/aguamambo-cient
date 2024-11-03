import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagersRoutingModule } from './managers-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from "../../shared/shared.module";
import { ReportsComponent } from './reports/reports.component';
import { BackupComponent } from './backup/backup.component';
import { SetupComponent } from './setup/setup.component';
import { ParameterisationModule } from './parameterisation/parameterisation.module';
import { TreasuryModule } from './treasury/treasury.module';
import { ReleasesModule } from './releases/releases.module';
import { SettingsComponent } from './settings/settings.component';
import { ContractTypeComponent } from './components/contract-type/contract-type.component';
import { EnterpriseComponent } from './components/enterprise/enterprise.component';
import { FineComponent } from './components/fine/fine.component';
import { InvoicePaymentComponent } from './components/invoice-payment/invoice-payment.component';
import { MeterComponent } from './components/meter/meter.component';
import { RubricComponent } from './components/rubric/rubric.component';
import { UserComponent } from './components/user/user.component';
import { ZoneComponent } from './components/zone/zone.component';
import { ReactiveFormsModule } from '@angular/forms'; 
import { ContractsModule } from './contracts/contracts.module';



@NgModule({
  declarations: [
    DashboardComponent, 
    ReportsComponent, 
    BackupComponent, 
    SetupComponent,
     SettingsComponent,
     EnterpriseComponent,
     ZoneComponent,
     MeterComponent,
     ContractTypeComponent,
     RubricComponent,
     UserComponent,
     FineComponent,
     InvoicePaymentComponent 
    ],
  imports: [
    CommonModule,
    ManagersRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    ParameterisationModule,
    TreasuryModule,
    ReleasesModule,
    ContractsModule
],
  exports: [
    DashboardComponent, 
    ReportsComponent, 
    BackupComponent, 
    SetupComponent,
    EnterpriseComponent,
    ZoneComponent,
    MeterComponent,
    ContractTypeComponent,
    RubricComponent,
    UserComponent,
    FineComponent,
    InvoicePaymentComponent 
  ]
})
export class ManagersModule { }
