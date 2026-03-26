export interface User {
  id?: string | null;
  tenantId?: string | null;
  ownerId?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  profileImageUrl?: string;
  role?: string;
  roleId?: string;
  phoneNumber: string;
}