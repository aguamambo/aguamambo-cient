export interface IInvoice {
    invoiceId: string;
    description: string;
    paymentMethod: string;
    limitDate: string;
    paymentDate: string;
    amount:number;
    fineAmount:number;
    totalAmount:number;
    finePercentage:number;
    readingId: string;
  }