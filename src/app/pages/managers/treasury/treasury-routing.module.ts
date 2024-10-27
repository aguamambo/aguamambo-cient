import { NgModule } from '@angular/core'; 
import { ListReceiptComponent } from './receipt/list-receipt/list-receipt.component';
import { RegisterReceiptComponent } from './receipt/register-receipt/register-receipt.component';
import { RegisterInvoiceComponent } from './invoice/register-invoice/register-invoice.component';
import { ListInvoiceComponent } from './invoice/list-invoice/list-invoice.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'invoices/add', component: RegisterInvoiceComponent },
  { path: 'invoices/list', component: ListInvoiceComponent },
  { path: 'receipts/list', component: ListReceiptComponent },
  { path: 'receipts/add', component: RegisterReceiptComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TreasuryRoutingModule {}
