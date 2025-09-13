export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: number;
  expiresIn: number;
}