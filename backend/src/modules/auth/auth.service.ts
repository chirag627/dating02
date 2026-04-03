import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const emailVerificationToken = uuidv4();

    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
      emailVerificationToken,
    });

    const tokens = await this.generateTokens(user);
    await this.usersService.update(user._id.toString(), {
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      emailVerificationToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    if (user.isBlocked) throw new UnauthorizedException('Account is blocked');

    const tokens = await this.generateTokens(user);
    await this.usersService.update(user._id.toString(), {
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
      lastActive: new Date(),
      onlineStatus: true,
    });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access denied');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Access denied');

    const tokens = await this.generateTokens(user);
    await this.usersService.update(user._id.toString(), {
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
    });

    return tokens;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmailWithTokens(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const resetToken = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.usersService.update(user._id.toString(), {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires,
    });

    // In production, send email via Nodemailer
    return { message: 'Password reset token sent', resetToken };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const users = await this.usersService.findAll({
      resetPasswordToken: dto.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!users.length) throw new BadRequestException('Invalid or expired token');

    const user = users[0];
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const users = await this.usersService.findAll({
      emailVerificationToken: token,
    });

    if (!users.length) throw new BadRequestException('Invalid verification token');

    await this.usersService.update(users[0]._id.toString(), {
      isVerified: true,
      emailVerificationToken: null,
    });

    return { message: 'Email verified successfully' };
  }

  async logout(userId: string) {
    await this.usersService.update(userId, {
      refreshToken: null,
      onlineStatus: false,
    });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_EXPIRY', '15m'),
        secret: this.configService.get('JWT_SECRET', 'secret'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
        secret: this.configService.get('JWT_REFRESH_SECRET', 'refresh_secret'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserDocument) {
    const { password, refreshToken, resetPasswordToken, ...sanitized } =
      user.toObject();
    return sanitized;
  }
}
