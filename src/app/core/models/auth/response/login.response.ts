import { User } from "../..";
import { JwtTokenResponse } from "./jwt.token.response";

export interface LoginResponse {
  requiresMfa: boolean;
  message: string;
  token?: JwtTokenResponse;
  refreshToken?: string;
  user?: User;
}
