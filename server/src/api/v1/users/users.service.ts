import { Injectable, ConflictException } from "@nestjs/common";
import { User } from "./interfaces/user.interface";

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: 1,
      username: "john",
      email: "john@example.com",
      password: "$2b$10$sYrHCm8bcwwKh7TJMsaro.aF4aC2lcvImlAME5E97EAUdLNLycti6", // hashed "changeme"
      fullName: "John Doe",
      isVerified: true,
    },
    {
      userId: 2,
      username: "maria",
      email: "maria@example.com",
      password: "$2b$10$OLLxSlGh18UBDGLVoKqIx.GbK05yxlyc6R4pfNazSSymytZUVFYEm", // hashed "guess"
      fullName: "Maria Garcia",
      isVerified: true,
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<User> {
    // Check if user already exists
    const existingUserByUsername = await this.findOne(userData.username);
    const existingUserByEmail = await this.findByEmail(userData.email);

    if (existingUserByUsername) {
      throw new ConflictException("Username already exists");
    }

    if (existingUserByEmail) {
      throw new ConflictException("Email already exists");
    }

    const newUser: User = {
      userId: this.users.length + 1,
      username: userData.username,
      email: userData.email,
      password: userData.password, // Will be hashed by AuthService
      fullName: userData.fullName,
      isVerified: false,
      verificationToken: this.generateToken(),
    };

    this.users.push(newUser);
    return newUser;
  }

  async verifyEmail(token: string): Promise<User | null> {
    const user = this.users.find((u) => u.verificationToken === token);
    if (user) {
      user.isVerified = true;
      user.verificationToken = undefined;
      return user;
    }
    return null;
  }

  async updateVerificationToken(email: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && !user.isVerified) {
      user.verificationToken = this.generateToken();
      return user;
    }
    return null;
  }

  async generatePasswordResetToken(email: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user) {
      user.resetPasswordToken = this.generateToken();
      return user;
    }
    return null;
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<User | null> {
    const user = this.users.find((u) => u.resetPasswordToken === token);
    if (user) {
      user.password = newPassword; // Will be hashed by AuthService
      user.resetPasswordToken = undefined;
      return user;
    }
    return null;
  }

  private generateToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
