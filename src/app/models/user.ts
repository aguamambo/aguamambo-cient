export interface IUser {
    userId: string;
    active: boolean;
    createdAt: string;  
    updatedAt: string; 
    name: string;
    role:string;
    username: string;
    password: string;
    phoneNumber: string;
    address: string;
    authorities: Array<{
      authority: string;
    }>;
    enabled: boolean;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    status: string;
  }
  