import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasuryRoutingModule } from './treasury-routing.module'; 
import { SharedModule } from "../../../shared/shared.module";
import { RegisterReceiptComponent } from './receipt/register-receipt/register-receipt.component';
import { ListReceiptComponent } from './receipt/list-receipt/list-receipt.component';
import { ListInvoiceComponent } from './invoice/list-invoice/list-invoice.component';
import { RegisterInvoiceComponent } from './invoice/register-invoice/register-invoice.component';



@NgModule({
  declarations: [ 
    RegisterReceiptComponent,
    ListReceiptComponent,
    ListInvoiceComponent,
    RegisterInvoiceComponent
  ],
  imports: [
    CommonModule,
    TreasuryRoutingModule,
    SharedModule
],
  exports: [
    
    RegisterReceiptComponent,
    ListReceiptComponent,
    ListInvoiceComponent,
    RegisterInvoiceComponent
  ]
})
export class TreasuryModule { }
