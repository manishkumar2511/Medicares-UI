export interface DecodedToken {
  nameid: string;
  email: string;
  role: string;
  tenantId: string;
  roleId: string;
  jti: string;
  userProfileImage: string;
  nbf: number;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}