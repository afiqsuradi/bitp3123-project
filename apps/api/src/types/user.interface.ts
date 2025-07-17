export interface JwtPayload {
  userId: number;
  username: string;
  name: string;
  iat: number;
  exp: number;
}
