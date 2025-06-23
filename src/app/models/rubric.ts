export interface IRubric {
  rubricId: string;
  name: string;
  description: string;
  price: number;
}

export interface IClientRubric {
  id: number,
  clientId: string,
  clientName: string,
  rubricId: string,
  description: string,
  quantity: number,
  createdAt: string
}