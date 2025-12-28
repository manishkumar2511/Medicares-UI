import { Address } from "..";

export interface Owner {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: Address;
}