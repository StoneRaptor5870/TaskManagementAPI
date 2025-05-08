import { Role } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: Role;
  refreshToken?: string;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}