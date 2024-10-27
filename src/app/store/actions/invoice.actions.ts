import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IInvoice } from 'src/app/models/invoice';

// GET invoices/{id}
export const getInvoice = createAction(
  '[Invoice] Load Invoice',
  props<{ invoiceId: string }>()
);

export const getInvoiceSuccess = createAction(
  '[Invoice] Load Invoice Success',
  props<{ invoice: IInvoice }>()
);

export const getInvoiceFailure = createAction(
  '[Invoice] Load Invoice Failure',
  props<{ error: any }>()
);

// GET invoices/{readingId}
export const getInvoiceByReadingId = createAction(
  '[Invoice] Load Invoice',
  props<{ readingId: string }>()
);

export const getInvoiceByReadingIdSuccess = createAction(
  '[Invoice] Load Invoice Success',
  props<{ invoice: IInvoice }>()
);

export const getInvoiceByReadingIdFailure = createAction(
  '[Invoice] Load Invoice Failure',
  props<{ error: any }>()
);

// GET invoices
export const listAllInvoices = createAction(
  '[Invoice] Load Invoices'
);

export const listAllInvoicesSuccess = createAction(
  '[Invoice] Load Invoices Success',
  props<{ invoices: IInvoice[] }>()
);

export const listAllInvoicesFailure = createAction(
  '[Invoice] Load Invoices Failure',
  props<{ error: any }>()
);

// POST invoices
export const createInvoice = createAction(
  '[Invoice] Create Invoice',
  props<{ invoice: IInvoice }>()
);

export const createInvoiceSuccess = createAction(
  '[Invoice] Create Invoice Success',
  props<{ invoice: IInvoice }>()
);

export const createInvoiceFailure = createAction(
  '[Invoice] Create Invoice Failure',
  props<{ error: any }>()
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
  props<{ error: any }>()
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
  props<{ error: any }>()
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
  props<{ error: any }>()
);
