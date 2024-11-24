import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { ListCustomersComponent } from "./customers/list-customers/list-customers.component";
import { ListCutsComponent } from "./cuts/list-cuts/list-cuts.component";
import { RegisterCutComponent } from "./cuts/register-cut/register-cut.component";
import { ListReadingsComponent } from "./reading/list-readings/list-readings.component";
import { RegisterReadingComponent } from "./reading/register-reading/register-reading.component";
import { ReleasesRoutingModule } from "./releases-routing.module";
import { ListSuspensionsComponent } from "./suspension/list-suspensions/list-suspensions.component";
import { RegisterSuspensionComponent } from "./suspension/register-suspension/register-suspension.component";
import { PendingReadingsComponent } from './reading/pending-readings/pending-readings.component';

 
@NgModule({
  declarations: [
    RegisterReadingComponent,
    ListReadingsComponent,
    ListSuspensionsComponent,
    RegisterSuspensionComponent,
    RegisterCutComponent,
    ListCutsComponent,
    ListCustomersComponent,
    PendingReadingsComponent 
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
    ListCustomersComponent 
  ]
})
export class ReleasesModule { }
