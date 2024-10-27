export interface IReading {
  readingId: string;
  active: boolean;
  consumption: number;
  dateChange: string;
  dateCreated: string;
  currentReading: number;
  lastReading: number;
  readingMonth: number;
  readingYear: number;
  state: string;
  meterId: string;
  userChange: string;
  userCreated: string; 
}