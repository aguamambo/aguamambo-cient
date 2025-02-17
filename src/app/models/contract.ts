export interface IContract {
  contractId: string;
  startDate: string;
  endDate: string;
  clientId: string;
  meterId: string;
  contractTypeId: string;
  description?: string;
  contractStatusDesc?: string;
  contractStatus: number;
  balance: number;
}