import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { ListInvoiceComponent } from "./invoice/list-invoice/list-invoice.component";
import { ListReceiptComponent } from "./receipt/list-receipt/list-receipt.component";
import { RegisterReceiptComponent } from "./receipt/register-receipt/register-receipt.component";
import { TreasuryRoutingModule } from "./treasury-routing.module";
import { OtherPaymentsComponent } from './invoice/other-payments/other-payments.component';

 
@NgModule({
  declarations: [ 
    RegisterReceiptComponent,
    ListReceiptComponent,
    ListInvoiceComponent,
    OtherPaymentsComponent 
  ],
  imports: [
    CommonModule,
    TreasuryRoutingModule,
    SharedModule
],
  exports: [
    
    RegisterReceiptComponent,
    ListReceiptComponent,
    ListInvoiceComponent 
  ]
})
export class TreasuryModule { }
