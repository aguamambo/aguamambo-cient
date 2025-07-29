export interface IClient {
    clientId: string;
    name: string;
    phoneNumber: string;
    address: string;
    nuit: string;
    balance: number;
    contractStatus: number;
    exemptFromFines: boolean;
     wantsReceiptSMS: boolean;
    wantsInvoiceSMS: boolean;
    contractTypeId: string;
    contractId: string;
    contractType: string;
    zoneId: string;
    zone: string;
  }