export interface IReading {
  readingId: string;
  active: boolean;
  consumption: number;
  updatedAt: string;
  createdAt: string;
  currentReading: number;
  previousReading: number;
  readingMonth: number;
  readingYear: number;
  state: string;
  meterId: string;
  userChanged: string;
  userCreated: string; 
}
