export interface OwnerListResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
    address?: string;
    state?: string;
    city?: string;
    postalCode?: string;
}
