import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
const bcrypt = require("bcrypt");
import { CreateUserDto } from "./dto/create-user.dto";
import { VerifyEmailDto, ResendVerificationDto } from "./dto/verify-email.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/password-reset.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds
    );

    // Create user with hashed password
    const user = await this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    // Return user info without password
    const { password, ...result } = user;
    return {
      message: "User registered successfully",
      user: result,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.usersService.verifyEmail(verifyEmailDto.token);
    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    const { password, ...result } = user;
    return {
      message: "Email verified successfully",
      user: result,
    };
  }

  async resendVerification(resendVerificationDto: ResendVerificationDto) {
    const user = await this.usersService.updateVerificationToken(
      resendVerificationDto.email
    );
    if (!user) {
      throw new Error("User not found or already verified");
    }

    return {
      message: "Verification email sent successfully",
      verificationToken: user.verificationToken, // In production, this would be sent via email
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.generatePasswordResetToken(
      forgotPasswordDto.email
    );
    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: "If the email exists, a password reset link has been sent",
      };
    }

    return {
      message: "Password reset email sent successfully",
      resetToken: user.resetPasswordToken, // In production, this would be sent via email
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      saltRounds
    );

    const user = await this.usersService.resetPassword(
      resetPasswordDto.token,
      hashedPassword
    );
    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    const { password, ...result } = user;
    return {
      message: "Password reset successfully",
      user: result,
    };
  }
}
