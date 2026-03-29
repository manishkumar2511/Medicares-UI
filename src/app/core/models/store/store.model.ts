export interface Store {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  addressLine: string;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: string;
}

export interface AddStoreRequest {
  name: string;
  phone: string;
  licenseNumber: string;
  addressLine: string;
  city: string;
  postalCode: string;
  stateId: string;
}
