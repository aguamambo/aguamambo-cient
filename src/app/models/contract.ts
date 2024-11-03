export interface IContract {
    contractId: string;
    startDate: string;
    endDate: string;
    clientId: string;
    meterId: string;
    contractTypeId: string;
    description?: string;
    contractStatus: string;
    balance: number;
  }