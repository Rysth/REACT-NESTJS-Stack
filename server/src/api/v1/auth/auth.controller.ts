import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "../../../common/guards/local-auth.guard";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { VerifyEmailDto, ResendVerificationDto } from "./dto/verify-email.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/password-reset.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("verify-email")
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post("resend-verification")
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto
  ) {
    return this.authService.resendVerification(resendVerificationDto);
  }

  @Post("forgot-password")
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post("reset-password")
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req: any) {
    return {
      message: "Profile retrieved successfully",
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  async logout(@Request() req: any) {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // In production, you might implement token blacklisting here
    return {
      message: "Logged out successfully",
    };
  }
}
