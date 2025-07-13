import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IInvoice, InvoicePayment } from 'src/app/models/invoice';
import { IFile } from 'src/app/models/file';
import { Error } from 'src/app/models/error';

// GET invoices/{id}
export const getInvoice = createAction(
  '[Invoice] Get Invoice',
  props<{ invoiceId: string }>()
);

export const getInvoiceSuccess = createAction(
  '[Invoice] Get Invoice Success',
  props<{ invoice: IInvoice }>()
);

export const getInvoiceFailure = createAction(
  '[Invoice] Get Invoice Failure',
  props<{ error: Error }>()
);

export const loadInvoicesByZone = createAction(
  '[Invoice] Load Invoices By Zone' 
);

export const loadInvoicesByZoneSuccess = createAction(
  '[Invoice] Load Invoices By Zone Success',
 props<{ data: { zone: string, total: number }[] }>()
);

export const loadInvoicesByZoneFailure = createAction(
  '[Invoice] Load Invoices By Zone Failure',
  props<{ error: Error }>()
);

export const loadRecentInvoices = createAction(
  '[Dashboard] Load Recent Invoices',
  props<{ period: string | null, region: string | null }>()
);

// Action for successful loading of recent invoices
export const loadRecentInvoicesSuccess = createAction(
  '[Dashboard] Load Recent Invoices Success',
  props<{ invoices: InvoicePayment[] }>()
);

// Action for failed loading of recent invoices
export const loadRecentInvoicesFailure = createAction(
  '[Dashboard] Load Recent Invoices Failure',
  props<{ error: Error }>()
);

// GET invoices/{readingId}
export const getInvoiceByReadingId = createAction(
  '[Invoice] Get Invoice By Reading',
  props<{ readingId: string }>()
);

export const getInvoiceByReadingIdSuccess = createAction(
  '[Invoice] Get Invoice By Reading Success',
  props<{ invoice: IInvoice }>()
);

export const getInvoiceByReadingIdFailure = createAction(
  '[Invoice] Get Invoice By Reading Failure',
  props<{ error: Error }>()
);

// GET invoice/client/{clientId}
export const getInvoiceByClientId = createAction(
  '[Invoice] Get Invoice By Client',
  props<{ clientId: string }>()
);

export const getInvoiceByClientIdSuccess = createAction(
  '[Invoice] Get Invoice By Client Success',
  props<{ invoice: IInvoice[] }>()
);

export const getInvoiceByClientIdFailure = createAction(
  '[Invoice] Get Invoice By Client Failure',
  props<{ error: Error }>()
);

export const getInvoiceByStatus = createAction(
  '[Invoice] Get Invoice By Status',
  props<{ clientId: string, status: boolean }>()
);

export const getInvoiceByStatusSuccess = createAction(
  '[Invoice] Get Invoice By Status Success',
  props<{ invoice: IInvoice[] }>()
);

export const getInvoiceByStatusFailure = createAction(
  '[Invoice] Get Invoice By Status Failure',
  props<{ error: Error }>()
);

export const getInvoiceByMeter = createAction(
  '[Invoice] Get Invoice By Meter',
  props<{ meterId: string}>()
);

export const getInvoiceByMeterSuccess = createAction(
  '[Invoice] Get Invoice By Meter Success',
  props<{ invoices: IInvoice[] }>()
);

export const getInvoiceByMeterFailure = createAction(
  '[Invoice] Get Invoice By Meter Failure',
  props<{ error: Error }>()
);

export const getInvoiceByZoneId = createAction(
  '[Invoice] Get Invoice By ZoneId',
  props<{ zoneId: string}>()
);

export const getInvoiceByZoneIdSuccess = createAction(
  '[Invoice] Get Invoice By ZoneId Success',
  props<{ invoices: IInvoice[] }>()
);

export const getInvoiceByZoneIdFailure = createAction(
  '[Invoice] Get Invoice By ZoneId Failure',
  props<{ error: Error }>()
);

// GET invoices/{readingId}
export const getWaterBillByReadingId = createAction(
  '[Invoice] Get WaterBil by Reading',
  props<{ readingId: string }>()
);

export const getWaterBillByReadingIdSuccess = createAction(
  '[Invoice] Get WaterBil by Reading Success',
  props<{ payload: IFile }>()  
);

export const getWaterBillByReadingIdFailure = createAction(
  '[Invoice] Get WaterBil by Reading Failure',
  props<{ error: Error }>()
);

// GET invoices/{zoneId}
export const getWaterBillsByZoneId = createAction(
  '[Invoice] Get WaterBils by Reading',
  props<{ zoneId: string }>()
);

export const getWaterBillsByZoneIdSuccess = createAction(
  '[Invoice] Get WaterBils by Reading Success',
  props<{ payload: IFile }>()  
);

export const getWaterBillsByZoneIdFailure = createAction(
  '[Invoice] Get WaterBils by Reading Failure',
  props<{ error: Error }>()
);

// GET invoices
export const listAllInvoices = createAction(
  '[Invoice] List All Invoices'
);

export const listAllInvoicesSuccess = createAction(
  '[Invoice] List All Invoices Success',
  props<{ invoices: IInvoice[] }>()
);

export const listAllInvoicesFailure = createAction(
  '[Invoice] List All Invoices Failure',
  props<{ error: Error }>()
);

// POST invoices
export const createInvoice = createAction(
  '[Invoice] Create Invoice',
  props<{ payload: any }>()
);

export const createInvoiceSuccess = createAction(
  '[Invoice] Create Invoice Success',
  props<{ invoice: IInvoice }>()
);

export const createInvoiceFailure = createAction(
  '[Invoice] Create Invoice Failure',
  props<{ error: Error }>()
);

// PUT invoices/{id}
export const updateInvoice = createAction(
  '[Invoice] Update Invoice',
  props<{ invoiceId: string, invoice: IInvoice }>()
);

export const updateInvoiceSuccess = createAction(
  '[Invoice] Update Invoice Success',
  props<{ invoice: IInvoice }>()
);

export const updateInvoiceFailure = createAction(
  '[Invoice] Update Invoice Failure',
  props<{ error: Error }>()
);

// DELETE invoices/{id}
export const deleteInvoice = createAction(
  '[Invoice] Delete Invoice',
  props<{ invoiceId: string }>()
);

export const deleteInvoiceSuccess = createAction(
  '[Invoice] Delete Invoice Success',
  props<{ invoiceId: string }>()
);

export const deleteInvoiceFailure = createAction(
  '[Invoice] Delete Invoice Failure',
  props<{ error: Error }>()
);

// GET invoices/count
export const loadInvoicesCount = createAction(
  '[Invoice] Load Invoices Count'
);

export const loadInvoicesCountSuccess = createAction(
  '[Invoice] Load Invoices Count Success',
  props<{ count: number }>()
);

export const loadInvoicesCountFailure = createAction(
  '[Invoice] Load Invoices Count Failure',
  props<{ error: Error }>()
);


export const resetInvoiceActions = createAction(
  '[Invoice] Reset all actions'
)
