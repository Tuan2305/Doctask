export interface User {
  userId: number;
  username: string;
  password?: string; // Password should not be exposed after login
  fullName: string;
  email?: string;
  phoneNumber?: string;
  position: string;
  positionId?: number; // FK to Position
  orgId?: number; // FK to Org
  unitId?: number; // FK to Unit
  userParent?: number; // FK to User
  unitUserId?: number; // FK to UnitUser
  createdAt: Date;

}