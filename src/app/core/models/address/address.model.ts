export interface Address {
  id?: string | null;
  addressLine: string;
  postalCode: string;
  city: string;
  stateId: string;      
  stateName?: string;
  country: string;
}