export interface User {
  userId: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
}
