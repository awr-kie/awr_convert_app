export enum UserRole {
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}
