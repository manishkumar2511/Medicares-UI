export interface User {
  id?: string | null;
  tenantId?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  profileImageUrl?: string;
  role?: string;
  phoneNumber: string;
}