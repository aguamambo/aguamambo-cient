export interface IInvoice {
    invoiceId: string;
    description: string;
    paymentMethod: string;
    limitDate: string;
    paymentStatus: boolean;
    paymentDate: string;
    amount:number;
    fineAmount:number;
    totalAmount:number;
    finePercentage:number;
    readingId: string;
  }