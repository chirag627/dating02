import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/utils/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh_secret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return this.authService.refreshTokens(payload.sub, dto.refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  verifyEmail(@Query() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  logout(@CurrentUser() user: any) {
    return this.authService.logout(user._id.toString());
  }
}
