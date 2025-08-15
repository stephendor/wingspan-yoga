export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  success: true;
  user: {
    id: string;
    email: string;
    name: string;
    membershipType: string;
  };
  token: string;
}

export interface LoginErrorResponse {
  success: false;
  error: string;
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterSuccessResponse {
  success: true;
  user: {
    id: string;
    email: string;
    name: string;
  };
  message: string;
}

export interface RegisterErrorResponse {
  success: false;
  error: string;
}

export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  membershipType: string;
  membershipStatus: string;
  role: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  membershipType: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}
