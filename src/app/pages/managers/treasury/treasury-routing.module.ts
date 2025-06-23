import { NgModule } from '@angular/core'; 
import { ListReceiptComponent } from './receipt/list-receipt/list-receipt.component';
import { RegisterReceiptComponent } from './receipt/register-receipt/register-receipt.component'; 
import { ListInvoiceComponent } from './invoice/list-invoice/list-invoice.component';
import { Routes, RouterModule } from '@angular/router';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { OtherPaymentsComponent } from './invoice/other-payments/other-payments.component';

const routes: Routes = [ 
  { path: 'invoices/list', component: ListInvoiceComponent, canActivate: [authGuard]   },
  { path: 'receipts/list', component: ListReceiptComponent, canActivate: [authGuard]   },
  { path: 'payments/invoice-payment', component: RegisterReceiptComponent, canActivate: [authGuard]   },
  { path: 'payments/other-payments', component: OtherPaymentsComponent, canActivate: [authGuard]   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TreasuryRoutingModule {}
